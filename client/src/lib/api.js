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

// Mutations are applied here so they survive navigation within a session.
const posts = structuredClone(mocks.posts.items);
const comments = structuredClone(mocks.comments.items);
let joinRequests = structuredClone(mocks.joinRequests.items);
const events = structuredClone(mocks.events.items);

/** `cursor` is the index of the first item of the page, as an opaque string. */
export function fetchPosts({ cursor = null, categoryId = null } = {}) {
  const matching = categoryId ? posts.filter((p) => p.category?.id === categoryId) : posts;
  // Pinned posts lead the feed regardless of age.
  const ordered = [...matching].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const start = cursor ? Number(cursor) : 0;
  const page = ordered.slice(start, start + MOCK_PAGE_SIZE);
  const next = start + MOCK_PAGE_SIZE < ordered.length ? String(start + MOCK_PAGE_SIZE) : null;

  return resolve({ items: page, nextCursor: next });
}

export function fetchPost(postId) {
  const post = posts.find((p) => p.id === postId);
  return post ? resolve(post) : Promise.reject(new Error("That post no longer exists."));
}

export function fetchComments(postId) {
  return resolve({ items: comments.filter((c) => c.postId === postId), nextCursor: null });
}

export function togglePostLike(postId) {
  const post = posts.find((p) => p.id === postId);
  post.hasLiked = !post.hasLiked;
  post.likeCount += post.hasLiked ? 1 : -1;
  return resolve({ hasLiked: post.hasLiked, likeCount: post.likeCount });
}

export function togglePostPin(postId) {
  const post = posts.find((p) => p.id === postId);
  post.isPinned = !post.isPinned;
  return resolve({ isPinned: post.isPinned });
}

export function toggleCommentLike(commentId) {
  const comment = comments.find((c) => c.id === commentId);
  comment.hasLiked = !comment.hasLiked;
  comment.likeCount += comment.hasLiked ? 1 : -1;
  return resolve({ hasLiked: comment.hasLiked, likeCount: comment.likeCount });
}

export function votePoll(postId, optionIds) {
  const { poll } = posts.find((p) => p.id === postId);
  const previous = new Set(poll.votedOptionIds);
  const next = new Set(optionIds);

  for (const option of poll.options) {
    const had = previous.has(option.id);
    const has = next.has(option.id);
    if (had === has) continue;
    option.voteCount += has ? 1 : -1;
  }
  // One person is one vote, however many options they picked.
  if (previous.size === 0 && next.size > 0) poll.totalVotes += 1;
  if (previous.size > 0 && next.size === 0) poll.totalVotes -= 1;
  poll.votedOptionIds = [...next];

  return resolve(poll);
}

export function createComment(postId, { content, parentCommentId = null }) {
  const comment = {
    id: `local-${Date.now()}`,
    postId,
    parentCommentId,
    content,
    author: { ...mocks.session.user },
    likeCount: 0,
    hasLiked: false,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.commentCount += 1;
    post.lastCommentAt = comment.createdAt;
  }
  return resolve(comment);
}

export function createPost(payload) {
  const category = mocks.categories.find((c) => c.id === payload.categoryId) ?? null;
  const post = {
    id: `local-${Date.now()}`,
    ...payload,
    author: { ...mocks.session.user, role: mocks.membership.role },
    category: category && { id: category.id, name: category.name },
    likeCount: 0,
    commentCount: 0,
    hasLiked: false,
    lastCommentAt: null,
    createdAt: new Date().toISOString(),
    poll: null,
    attachments: [],
  };
  posts.unshift(post);
  return resolve(post);
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

/**
 * Only one course carries a module tree in the seed data. The others resolve
 * with `modules: null`, which the classroom surfaces rather than faking.
 */
export function fetchCourse(courseSlug) {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return Promise.reject(new Error("That course no longer exists."));
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

export function fetchSettings(slug) {
  return resolve({
    group: { ...group, slug },
    categories,
    tiers,
    questions: joinQuestions,
    preferences,
    invites,
  });
}

export function updateGroup(patch) {
  group = { ...group, ...patch };
  return resolve(group);
}

export function updatePricing(patch) {
  // The API refuses Paid without a price and an interval; mirror that here so
  // the client never learns the rule only from a server it cannot reach.
  if (patch.pricingModel === "PAID" && (!patch.price || !patch.billingInterval)) {
    return Promise.reject(new Error("A paid community needs a price and a billing interval."));
  }
  group = {
    ...group,
    ...patch,
    price: patch.pricingModel === "FREE" ? null : patch.price,
    billingInterval: patch.pricingModel === "FREE" ? null : patch.billingInterval,
    trialDays: patch.pricingModel === "FREE" ? null : patch.trialDays,
  };
  return resolve(group);
}

/* categories */

export function addCategory(name) {
  const category = { id: `local-${Date.now()}`, name, postCount: 0, position: categories.length };
  categories = [...categories, category];
  return resolve(category);
}

export function renameCategory(categoryId, name) {
  categories = categories.map((c) => (c.id === categoryId ? { ...c, name } : c));
  return resolve(categories);
}

export function deleteCategory(categoryId) {
  categories = categories.filter((c) => c.id !== categoryId).map((c, i) => ({ ...c, position: i }));
  return resolve(categories);
}

export function reorderCategories(orderedIds) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  categories = orderedIds.map((id, i) => ({ ...byId.get(id), position: i }));
  return resolve(categories);
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
