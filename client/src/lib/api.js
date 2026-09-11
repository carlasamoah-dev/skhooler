/**
 * The single place the app reads and writes data. Everything is served from the
 * mock layer for now; swapping these bodies for fetch calls against the
 * endpoints in 02-api-contracts.md is the only change needed later.
 */
import * as mocks from "./mocks";

const LATENCY_MS = 120;

// Mutable copies of the seed. Writes land here so they survive navigation
// within a session; a full page load starts them over.
let group = structuredClone(mocks.group);
let categories = structuredClone(mocks.categories);
let tiers = structuredClone(mocks.tiers);
let joinQuestions = structuredClone(mocks.joinQuestions);
let preferences = structuredClone(mocks.notificationPreferences);
const invites = structuredClone(mocks.invites);

/**
 * The real endpoint defaults to 20 per page. The seed data holds four posts, so
 * the mock pages them two at a time and the feed's pagination is exercised
 * rather than assumed.
 */
const MOCK_PAGE_SIZE = 2;

function resolve(value) {
  return new Promise((r) => setTimeout(() => r(structuredClone(value)), LATENCY_MS));
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
}

export async function authFetch(path, options = {}, retry = true) {
  let token = getToken();
  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    try {
      const { refreshTokens } = await import("./auth");
      await refreshTokens();
      // Retry once with new token
      return authFetch(path, options, false);
    } catch (e) {
      // Refresh failed, let the original 401 fail below
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || "Something went wrong";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data.data ?? data;
}

/**
 * Upload a single File to Supabase Storage via a backend-issued signed URL.
 * Returns the public URL of the uploaded file, or null if no file provided.
 */
export async function uploadImage(file, bucket) {
  if (!file) return null;

  // 1. Get signed URL from backend
  const { signedUrl, publicUrl } = await authFetch("/upload/signed-url", {
    method: "POST",
    body: JSON.stringify({
      bucket,
      filename: file.name,
      contentType: file.type,
    }),
  });

  // 2. PUT the file directly to Supabase Storage
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image to storage");
  }

  return publicUrl;
}

/* --------------------------------- shell --------------------------------- */

const ROLES = ["OWNER", "ADMIN", "MODERATOR", "MEMBER"];

/**
 * Mock-only: `?as=MEMBER` previews the app as another role, so the permission
 * gates can be seen rather than taken on trust. The real API derives the role
 * from the session and this disappears with it.
 */
function previewRole() {
  if (typeof window === "undefined") return null;
  const asked = new URLSearchParams(window.location.search).get("as")?.toUpperCase();
  return ROLES.includes(asked) ? asked : null;
}

/**
 * Everything the app shell needs before it can render a group. Reads the same
 * mutable records the settings panels write, so a rename or a reorder there
 * shows up in the shell and the feed without a reload.
 */
export function fetchGroupBundle(slug) {
  const role = previewRole();
  return resolve({
    group: { ...group, slug },
    membership: role ? { ...mocks.membership, role } : mocks.membership,
    categories,
    tiers,
    user: mocks.session.user,
  });
}

export function fetchNotifications() {
  return resolve(mocks.notifications);
}

/* ---------------------------------- feed --------------------------------- */

// Keep mock join requests + events (not yet migrated)
let joinRequests = structuredClone(mocks.joinRequests.items);
const events = structuredClone(mocks.events.items);

/**
 * Fetch paginated posts from the real backend.
 * @param {string} slug - community slug
 * @param {{ cursor?: string, categoryId?: string }} opts
 */
export async function fetchPosts(slug, { cursor = null, categoryId = null, sort = 'new' } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (categoryId) params.set("categoryId", categoryId);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  const result = await authFetch(`/groups/${slug}/posts${qs ? `?${qs}` : ""}`);
  // Backend returns { data: [...], meta: { nextCursor } }
  const items = result?.data ?? result ?? [];
  const nextCursor = result?.meta?.nextCursor ?? null;
  return { items, nextCursor };
}

export async function getSession() {
  return authFetch("/auth/me");
}

export async function updateAccount(payload) {
  const result = await authFetch("/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return result?.data ?? result;
}

export async function fetchUserProfile(username) {
  const result = await authFetch(`/users/${username}`, { cache: "no-store" });
  return result?.data ?? result;
}

export async function fetchPost(slug, postId) {
  return authFetch(`/groups/${slug}/posts/${postId}`);
}

export async function fetchComments(slug, postId) {
  const result = await authFetch(`/groups/${slug}/posts/${postId}/comments`);
  const items = result?.data ?? result ?? [];
  return { items, nextCursor: result?.meta?.nextCursor ?? null };
}

export async function togglePostLike(slug, postId) {
  return authFetch(`/groups/${slug}/posts/${postId}/like`, { method: "POST" });
}

export async function togglePostPin(slug, postId) {
  return authFetch(`/groups/${slug}/posts/${postId}/pin`, { method: "POST" });
}

export async function toggleCommentLike(slug, postId, commentId) {
  return authFetch(`/groups/${slug}/posts/${postId}/comments/${commentId}/like`, { method: "POST" });
}

export async function votePoll(slug, postId, optionIds) {
  return authFetch(`/groups/${slug}/posts/${postId}/poll/vote`, {
    method: "POST",
    body: JSON.stringify({ optionIds }),
  });
}

export async function createComment(slug, postId, { content, parentCommentId = null }) {
  return authFetch(`/groups/${slug}/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentCommentId }),
  });
}

export async function createPost(slug, payload) {
  const result = await authFetch(`/groups/${slug}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return result?.data ?? result;
}


export async function deletePost(slug, postId) {
  return authFetch(`/groups/${slug}/posts/${postId}`, { method: "DELETE" });
}

export async function togglePostComments(slug, postId) {
  return authFetch(`/groups/${slug}/posts/${postId}/comments/toggle`, { method: "POST" });
}

export async function updatePost(slug, postId, payload) {
  const result = await authFetch(`/groups/${slug}/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return result?.data ?? result;
}


/* ------------------------------- sidebar --------------------------------- */

export function fetchJoinRequests() {
  return resolve({ items: joinRequests, total: joinRequests.length });
}

export function decideJoinRequest(requestId) {
  joinRequests = joinRequests.filter((r) => r.id !== requestId);
  return resolve({ ok: true });
}

/** The soonest event that has not been cancelled. */
export function fetchNextEvent() {
  const upcoming = events
    .filter((e) => !e.isCancelled)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  return resolve(upcoming[0] ?? null);
}

/** Mock-only: `?fail=rsvp` makes the write reject, so the optimistic revert can be seen. */
function shouldFail(what) {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("fail") === what;
}

export function rsvpEvent(eventId, status) {
  if (shouldFail("rsvp")) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Could not save your RSVP.")), LATENCY_MS),
    );
  }
  const event = events.find((e) => e.id === eventId);
  if (event.myRsvp === "GOING" && status !== "GOING") event.attendeeCount -= 1;
  if (event.myRsvp !== "GOING" && status === "GOING") event.attendeeCount += 1;
  event.myRsvp = status;
  return resolve({ myRsvp: event.myRsvp, attendeeCount: event.attendeeCount });
}

/* ------------------------------- classroom -------------------------------- */

const courses = structuredClone(mocks.courses);
const courseDetail = structuredClone(mocks.courseDetail);
const lessonDetail = structuredClone(mocks.lesson);

export function fetchCourses() {
  return resolve(courses);
}

export function createCourse(payload) {
  const newCourse = {
    id: `course-${Date.now()}`,
    ...payload,
    isPublished: false,
    moduleCount: 0,
    lessonCount: 0,
    progressPercent: 0,
    modules: [],
  };
  courses.unshift(newCourse);
  return resolve(newCourse);
}

export function updateCourse(courseId, payload) {
  const index = courses.findIndex(c => c.id === courseId);
  if (index === -1) return Promise.reject(new Error("Course not found"));
  courses[index] = { ...courses[index], ...payload };
  return resolve(courses[index]);
}

/**
 * Only one course carries a module tree in the seed data. The others resolve
 * with `modules: null`, which the classroom surfaces rather than faking.
 */
export function fetchCourse(courseSlug) {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return Promise.reject(new Error("That course no longer exists."));
  
  // If it was created dynamically during this session, it has modules: []
  if (course.modules !== undefined) return resolve(course);
  
  if (course.slug !== courseDetail.slug) return resolve({ ...course, modules: null });
  return resolve({ ...course, modules: courseDetail.modules });
}

/** Flattens the module tree so prev/next can walk it. */
function lessonOrder() {
  return courseDetail.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
}

export function fetchLesson(lessonId) {
  const order = lessonOrder();
  const index = order.findIndex((l) => l.id === lessonId);
  if (index === -1) return Promise.reject(new Error("That lesson no longer exists."));

  const entry = order[index];
  // Only one lesson carries full body copy; the rest reuse its shape.
  const detail = entry.id === lessonDetail.id ? lessonDetail : null;

  return resolve({
    ...entry,
    lessonNumber: courseDetail.modules.find((m) => m.id === entry.moduleId).lessons.findIndex((l) => l.id === entry.id) + 1,
    content: detail?.content ?? null,
    videoPlaybackId: detail?.videoPlaybackId ?? `mock-playback-${entry.id}`,
    chapters: detail?.chapters ?? [],
    attachments: detail?.attachments ?? [],
    previousLessonId: index > 0 ? order[index - 1].id : null,
    nextLessonId: index < order.length - 1 ? order[index + 1].id : null,
  });
}

export function setLessonProgress(lessonId, isCompleted) {
  for (const group of courseDetail.modules) {
    const lesson = group.lessons.find((l) => l.id === lessonId);
    if (!lesson) continue;
    lesson.progress = { ...lesson.progress, isCompleted };
  }

  // The course percentage is derived, so the card and the sidebar cannot drift.
  const all = courseDetail.modules.flatMap((m) => m.lessons);
  const done = all.filter((l) => l.progress?.isCompleted).length;
  const percent = Math.round((done / all.length) * 100);
  const card = courses.find((c) => c.slug === courseDetail.slug);
  if (card) card.progressPercent = percent;
  courseDetail.progressPercent = percent;

  return resolve({ isCompleted, progressPercent: percent });
}

/* ------------------------------- analytics -------------------------------- */

const WEEK = mocks.analyticsGrowth.points;

/**
 * The seed carries a weekly series. Day and month are derived from it so the
 * interval control has something to switch between; only the labels differ in
 * kind, and the real endpoint returns all three.
 */
function seriesFor(interval) {
  if (interval === "week") return WEEK;

  const today = new Date("2026-09-05T00:00:00Z");
  if (interval === "day") {
    return WEEK.map((point, i) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - (WEEK.length - 1 - i));
      return {
        label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
        value: Math.round(point.value / 7),
      };
    });
  }

  return WEEK.map((point, i) => {
    const date = new Date(today);
    date.setUTCMonth(date.getUTCMonth() - (WEEK.length - 1 - i));
    return {
      label: date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
      value: point.value * 4,
    };
  });
}

export function fetchAnalyticsOverview() {
  return resolve(mocks.analyticsOverview);
}

export function fetchAnalyticsGrowth(interval = "week") {
  return resolve({ interval, points: seriesFor(interval) });
}

export function fetchAnalyticsSources() {
  return resolve({ sources: mocks.analyticsSources, referral: mocks.referralStats });
}

/* -------------------------------- events ---------------------------------- */

export function fetchEvents({ filter = "upcoming", now = Date.now() } = {}) {
  const withinFilter = (event) => {
    if (filter === "all") return true;
    // A recurring event keeps coming round, so it is never "past".
    if (event.isRecurring) return filter === "upcoming";
    const isPast = new Date(event.startDate).getTime() < now;
    return filter === "past" ? isPast : !isPast;
  };

  const items = events
    .filter(withinFilter)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return resolve({ items, nextCursor: null });
}

/** Every event, whatever the filter — the month grid shows the month, not a slice. */
export function fetchEventsForMonth() {
  return resolve({ items: [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) });
}

export function createEvent(payload) {
  const event = {
    id: `local-${Date.now()}`,
    attendeeCount: 0,
    myRsvp: null,
    isCancelled: false,
    timezone: mocks.group.timezone ?? "Europe/London",
    ...payload,
  };
  events.push(event);
  return resolve(event);
}

export function updateEvent(eventId, payload) {
  const event = events.find((e) => e.id === eventId);
  Object.assign(event, payload);
  return resolve(event);
}

export function cancelEvent(eventId) {
  const event = events.find((e) => e.id === eventId);
  event.isCancelled = true;
  return resolve(event);
}

/* -------------------------------- settings -------------------------------- */

export async function fetchSettings(slug) {
  const g = await authFetch(`/groups/${slug}`);
  
  return {
    group: {
      id: g.id,
      slug: g.slug,
      name: g.name,
      description: g.description ?? "",
      iconUrl: g.iconUrl ?? null,
      coverUrl: g.coverUrl ?? null,
      visibility: g.visibility,
      pricingModel: g.pricingModel,
      price: g.price,
      billingInterval: g.billingInterval,
      trialDays: g.trialDays,
      joinApproval: g.joinApproval,
      autoWelcomeMessage: g.autoWelcomeMessage ?? "",
      tags: g.tags ?? [],
    },
    categories: Array.isArray(g.categories) ? g.categories : [],
    tiers: Array.isArray(g.memberTiers) ? g.memberTiers : [],
    questions: joinQuestions, // Not yet migrated
    preferences: preferences, // Not yet migrated
    invites: invites,         // Not yet migrated
  };
}

export async function updateGroup(slug, patch) {
  const data = await authFetch(`/groups/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data;
}

export async function updatePricing(slug, patch) {
  // The API refuses Paid without a price and an interval; mirror that here so
  // the client never learns the rule only from a server it cannot reach.
  if (patch.pricingModel === "PAID" && (!patch.price || !patch.billingInterval)) {
    return Promise.reject(new Error("A paid community needs a price and a billing interval."));
  }
  const data = await authFetch(`/groups/${slug}/pricing`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data;
}

/* categories */

export async function addCategory(slug, name) {
  const data = await authFetch(`/groups/${slug}/categories`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function renameCategory(slug, categoryId, name) {
  const data = await authFetch(`/groups/${slug}/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function deleteCategory(slug, categoryId) {
  const data = await authFetch(`/groups/${slug}/categories/${categoryId}`, {
    method: "DELETE",
  });
  return data;
}

export async function reorderCategories(slug, orderedIds) {
  const data = await authFetch(`/groups/${slug}/categories/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
  return data;
}

/* tiers — name only, never a price */

export function addTier(name) {
  const tier = { id: `local-${Date.now()}`, name, memberCount: 0, lockedContent: "no locked content" };
  tiers = [...tiers, tier];
  return resolve(tier);
}

export function renameTier(tierId, name) {
  tiers = tiers.map((t) => (t.id === tierId ? { ...t, name } : t));
  return resolve(tiers);
}

export function deleteTier(tierId) {
  tiers = tiers.filter((t) => t.id !== tierId);
  return resolve(tiers);
}

/* join questions — at most three */

export function saveQuestions(questions) {
  if (questions.length > 3) return Promise.reject(new Error("Three questions is the maximum."));
  joinQuestions = questions.map((q, i) => ({ ...q, id: q.id ?? `local-${i}`, position: i }));
  return resolve(joinQuestions);
}

/* notification preferences */

export function savePreferences(next) {
  preferences = { ...preferences, ...next };
  return resolve(preferences);
}

/* invites */

export function createInvite({ maxUses, expiresInDays }) {
  const code = `RJHQ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + Number(expiresInDays) * 86_400_000).toISOString();
  const invite = { id: `local-${Date.now()}`, code, useCount: 0, maxUses: Number(maxUses), expiresAt };
  invites.items = [invite, ...invites.items];
  return resolve(invite);
}

export function revokeInvite(inviteId) {
  invites.items = invites.items.filter((i) => i.id !== inviteId);
  return resolve(invites.items);
}

export function emailInvites(emails) {
  if (emails.length > 50) return Promise.reject(new Error("Fifty addresses at a time is the maximum."));
  return resolve({ sent: emails.length });
}

/* -------------------------------- members --------------------------------- */

const members = structuredClone(mocks.members.items);
let memberCounts = structuredClone(mocks.members.counts);

const ROLE_FILTER = {
  admins: ["OWNER", "ADMIN"],
  mods: ["MODERATOR"],
  members: ["MEMBER"],
};

export function fetchMembers({ role = "all" } = {}) {
  const wanted = ROLE_FILTER[role];
  const items = wanted ? members.filter((m) => wanted.includes(m.role)) : members;
  return resolve({ items, nextCursor: null, counts: memberCounts });
}

export function fetchMemberProfile(memberId) {
  const member = mocks.members.find((m) => m.id === memberId);
  if (!member) return Promise.reject(new Error("That member no longer exists."));
  
  // They authored every post in the mock.
  return resolve({ ...member, recentPosts: mocks.posts });
}



export function changeMemberRole(memberId, role) {
  const member = members.find((m) => m.id === memberId);
  member.role = role;
  return resolve(member);
}

export function changeMemberTier(memberId, tierId) {
  const member = members.find((m) => m.id === memberId);
  member.tier = tierId ? tiers.find((t) => t.id === tierId) ?? null : null;
  return resolve(member);
}

export function setCourseAccess(memberId, courseId, granted) {
  const member = members.find((m) => m.id === memberId);
  const current = new Set(member.courseAccess ?? []);
  if (granted) current.add(courseId);
  else current.delete(courseId);
  member.courseAccess = [...current];
  return resolve(member);
}

export function removeMember(memberId) {
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) return Promise.reject(new Error("That member is no longer in the group."));
  const [removed] = members.splice(index, 1);
  memberCounts = {
    ...memberCounts,
    all: memberCounts.all - 1,
    admins: memberCounts.admins - (removed.role === "ADMIN" || removed.role === "OWNER" ? 1 : 0),
    moderators: memberCounts.moderators - (removed.role === "MODERATOR" ? 1 : 0),
    members: memberCounts.members - (removed.role === "MEMBER" ? 1 : 0),
  };
  return resolve({ ok: true });
}

/** Approving a request adds to the group; both outcomes clear the queue entry. */
export function approveJoinRequest(requestId) {
  joinRequests = joinRequests.filter((r) => r.id !== requestId);
  memberCounts = {
    ...memberCounts,
    all: memberCounts.all + 1,
    members: memberCounts.members + 1,
    pendingRequests: memberCounts.pendingRequests - 1,
  };
  return resolve({ ok: true, counts: memberCounts });
}

export function declineJoinRequest(requestId) {
  joinRequests = joinRequests.filter((r) => r.id !== requestId);
  memberCounts = { ...memberCounts, pendingRequests: memberCounts.pendingRequests - 1 };
  return resolve({ ok: true, counts: memberCounts });
}

export function fetchGeography() {
  return resolve(mocks.memberGeography);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Real backend — group discovery & global search
───────────────────────────────────────────────────────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Fetch ranked, filterable public groups from the backend.
 * @param {{ q?: string, tag?: string, pricing?: string, page?: number, limit?: number }} params
 */
export async function fetchDiscoverGroups(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.tag) qs.set("tag", params.tag);
  if (params.pricing) qs.set("pricing", params.pricing);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/groups?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch communities");
  const data = await response.json();
  return data.data; // { groups, total, page, totalPages }
}

/**
 * Global community search via the backend's global search endpoint.
 * @param {string} q
 */
export async function fetchGlobalSearch(q) {
  if (!q || !q.trim()) return { groups: [] };
  const qs = new URLSearchParams({ q: q.trim() });
  const response = await fetch(`${API_URL}/groups/search-global?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) return { groups: [] };
  const data = await response.json();
  return data.data?.results ?? { groups: [] };
}
