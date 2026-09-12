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
    credentials: "include",
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

export async function authFetchFull(path, options = {}, retry = true) {
  let token = getToken();
  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
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
      return authFetchFull(path, options, false);
    } catch (e) {}
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || "Something went wrong";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
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

export async function fetchJoinRequests(slug, cursor = null) {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  const result = await authFetchFull(`/groups/${slug}/requests?${qs.toString()}`);
  return { items: result?.data ?? [], total: result?.meta?.total ?? 0 };
}

export async function decideJoinRequest(slug, requestId, approve) {
  const action = approve ? "approve" : "decline";
  await authFetch(`/groups/${slug}/requests/${requestId}/${action}`, { method: "POST" });
  return { ok: true };
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

/**
 * Fetch all courses for a community.
 * @param {string} slug - community slug
 */
export async function fetchCourses(slug) {
  return authFetch(`/groups/${slug}/courses`);
}

/**
 * Create a new course.
 * @param {string} slug - community slug
 * @param {{ title, description, coverUrl, accessType, requiredTierId, isPublished }} payload
 */
export async function createCourse(slug, payload) {
  return authFetch(`/groups/${slug}/courses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update a course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 * @param {object} payload - partial course fields
 */
export async function updateCourse(slug, courseId, payload) {
  return authFetch(`/groups/${slug}/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch a single course with its full module+lesson tree.
 * @param {string} slug - community slug
 * @param {string} courseSlug - course slug string
 */
export async function fetchCourse(slug, courseSlug) {
  return authFetch(`/groups/${slug}/courses/${courseSlug}`);
}

/**
 * Fetch a single lesson with progress data.
 * @param {string} slug - community slug
 * @param {string} lessonId - UUID
 */
export async function fetchLesson(slug, lessonId) {
  return authFetch(`/groups/${slug}/courses/lessons/${lessonId}`);
}

/**
 * Update lesson progress (mark complete / save video position).
 * @param {string} slug - community slug
 * @param {string} lessonId - UUID
 * @param {{ isCompleted?: boolean, lastPositionSeconds?: number }} payload
 */
export async function setLessonProgress(slug, lessonId, payload) {
  return authFetch(`/groups/${slug}/courses/lessons/${lessonId}/progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get overall progress for a course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 */
export async function getCourseProgress(slug, courseId) {
  return authFetch(`/groups/${slug}/courses/${courseId}/progress`);
}

/**
 * Create a new module inside a course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 * @param {{ title, isPublished? }} payload
 */
export async function createModule(slug, courseId, payload) {
  return authFetch(`/groups/${slug}/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update a module.
 * @param {string} slug - community slug
 * @param {string} moduleId - UUID
 * @param {object} payload - partial module fields
 */
export async function updateModule(slug, moduleId, payload) {
  return authFetch(`/groups/${slug}/courses/modules/${moduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a module (soft delete).
 * @param {string} slug - community slug
 * @param {string} moduleId - UUID
 */
export async function deleteModule(slug, moduleId) {
  return authFetch(`/groups/${slug}/courses/modules/${moduleId}`, {
    method: 'DELETE',
  });
}

/**
 * Create a new lesson inside a module.
 * @param {string} slug - community slug
 * @param {string} moduleId - UUID
 * @param {{ title, content?, videoUrl?, transcript?, chapters?, attachments?, isPublished?, isFreePreview? }} payload
 */
export async function createLesson(slug, moduleId, payload) {
  return authFetch(`/groups/${slug}/courses/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update a lesson (title, content, video, transcript, chapters, attachments, flags).
 * @param {string} slug - community slug
 * @param {string} lessonId - UUID
 * @param {object} payload - partial lesson fields
 */
export async function updateLesson(slug, lessonId, payload) {
  return authFetch(`/groups/${slug}/courses/lessons/${lessonId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a lesson (soft delete).
 * @param {string} slug - community slug
 * @param {string} lessonId - UUID
 */
export async function deleteLesson(slug, lessonId) {
  return authFetch(`/groups/${slug}/courses/lessons/${lessonId}`, {
    method: 'DELETE',
  });
}

/**
 * Grant a specific member access to a PRIVATE_GRANT course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 * @param {string} userId - member's user UUID
 */
export async function grantCourseAccess(slug, courseId, userId) {
  return authFetch(`/groups/${slug}/courses/${courseId}/access`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

/**
 * Revoke a specific member's access to a PRIVATE_GRANT course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 * @param {string} userId - member's user UUID
 */
export async function revokeCourseAccess(slug, courseId, userId) {
  return authFetch(`/groups/${slug}/courses/${courseId}/access/${userId}`, {
    method: 'DELETE',
  });
}

/**
 * List all members granted access to a PRIVATE_GRANT course.
 * @param {string} slug - community slug
 * @param {string} courseId - UUID
 */
export async function getCourseAccessList(slug, courseId) {
  return authFetch(`/groups/${slug}/courses/${courseId}/access`);
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
    tiers: Array.isArray(g.memberTiers) ? g.memberTiers.map(t => ({
      ...t,
      memberCount: t._count?.members || 0,
      lockedContent: "no locked content"
    })) : [],
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

export async function addTier(slug, name) {
  const data = await authFetch(`/groups/${slug}/tiers`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function renameTier(slug, tierId, name) {
  const data = await authFetch(`/groups/${slug}/tiers/${tierId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function deleteTier(slug, tierId) {
  const data = await authFetch(`/groups/${slug}/tiers/${tierId}`, {
    method: "DELETE",
  });
  return data;
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

export async function fetchMembers(slug, { role = "all", cursor = null } = {}) {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  qs.set("role", role);
  
  const result = await authFetchFull(`/groups/${slug}/members?${qs.toString()}`);
  
  return { 
    items: result?.data ?? [], 
    nextCursor: result?.meta?.nextCursor ?? null, 
    counts: result?.meta?.counts ?? { all: 0, admins: 0, moderators: 0, members: 0, pendingRequests: 0 } 
  };
}

export async function fetchMemberProfile(slug, memberId) {
  const result = await authFetch(`/groups/${slug}/members/${memberId}/profile`);
  return result?.data ?? result;
}

export async function changeMemberRole(slug, memberId, role) {
  const result = await authFetch(`/groups/${slug}/members/${memberId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return result?.data ?? result;
}

export async function changeMemberTier(slug, memberId, tierId) {
  const result = await authFetch(`/groups/${slug}/members/${memberId}/tier`, {
    method: "PATCH",
    body: JSON.stringify({ tierId }),
  });
  return result?.data ?? result;
}

export async function setCourseAccess(slug, userId, courseId, granted) {
  if (granted) {
    return grantCourseAccess(slug, courseId, userId);
  } else {
    return revokeCourseAccess(slug, courseId, userId);
  }
}

export async function removeMember(slug, memberId) {
  await authFetch(`/groups/${slug}/members/${memberId}`, {
    method: "DELETE",
  });
  return { ok: true };
}

export async function approveJoinRequest(slug, requestId) {
  await authFetch(`/groups/${slug}/requests/${requestId}/approve`, {
    method: "POST",
  });
  return { ok: true };
}

export async function declineJoinRequest(slug, requestId) {
  await authFetch(`/groups/${slug}/requests/${requestId}/decline`, {
    method: "POST",
  });
  return { ok: true };
}

export async function fetchGeography(slug) {
  return authFetch(`/groups/${slug}/members/geography`);
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
