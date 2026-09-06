/**
 * The single place the app reads and writes data. Everything is served from the
 * mock layer for now; swapping these bodies for fetch calls against the
 * endpoints in 02-api-contracts.md is the only change needed later.
 */
import * as mocks from "./mocks";

const LATENCY_MS = 120;

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

/** Everything the app shell needs before it can render a group. */
export function fetchGroupBundle(slug) {
  const role = previewRole();
  return resolve({
    group: { ...mocks.group, slug },
    membership: role ? { ...mocks.membership, role } : mocks.membership,
    categories: mocks.categories,
    tiers: mocks.tiers,
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

export function rsvpEvent(eventId, status) {
  const event = events.find((e) => e.id === eventId);
  if (event.myRsvp === "GOING" && status !== "GOING") event.attendeeCount -= 1;
  if (event.myRsvp !== "GOING" && status === "GOING") event.attendeeCount += 1;
  event.myRsvp = status;
  return resolve({ myRsvp: event.myRsvp, attendeeCount: event.attendeeCount });
}
