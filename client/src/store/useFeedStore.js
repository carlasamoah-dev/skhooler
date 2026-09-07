import { create } from "zustand";

import { fetchPosts, togglePostLike } from "@/lib/api";

/** The API has no sort parameter, so ordering is applied to the loaded page. */
export const SORTS = [
  { value: "new", label: "Newest" },
  { value: "comments", label: "Most comments" },
  { value: "likes", label: "Most liked" },
];

function order(items, sort) {
  const sorted = [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (sort === "comments") return b.commentCount - a.commentCount;
    if (sort === "likes") return b.likeCount - a.likeCount;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return sorted;
}

export const useFeedStore = create((set, get) => ({
  filterCategoryId: null,
  sort: "new",
  cursor: null,
  posts: [],
  status: "idle", // idle | loading | loadingMore | ready | error
  error: null,
  requestId: 0,

  /** Fresh load for the current filter, discarding anything already held. */
  async load() {
    const requestId = get().requestId + 1;
    set({ requestId, status: "loading", error: null, posts: [], cursor: null });
    try {
      const { items, nextCursor } = await fetchPosts({ categoryId: get().filterCategoryId });
      if (get().requestId !== requestId) return; // a newer filter won
      set({ posts: order(items, get().sort), cursor: nextCursor, status: "ready" });
    } catch (error) {
      if (get().requestId !== requestId) return;
      set({ status: "error", error: error?.message ?? "Could not load the feed." });
    }
  },

  async loadMore() {
    const { cursor, status, filterCategoryId, requestId } = get();
    if (!cursor || status === "loading" || status === "loadingMore") return;

    set({ status: "loadingMore" });
    try {
      const { items, nextCursor } = await fetchPosts({ cursor, categoryId: filterCategoryId });
      if (get().requestId !== requestId) return;
      set((s) => ({ posts: order([...s.posts, ...items], s.sort), cursor: nextCursor, status: "ready" }));
    } catch (error) {
      if (get().requestId !== requestId) return;
      set({ status: "error", error: error?.message ?? "Could not load more posts." });
    }
  },

  setCategory(filterCategoryId) {
    set({ filterCategoryId });
    get().load();
  },

  /** Reorders what is already loaded; it does not refetch. */
  setSort(sort) {
    set((s) => ({ sort, posts: order(s.posts, sort) }));
  },

  /** Optimistic, reverted if the write fails. */
  async toggleLike(postId) {
    const before = get().posts.find((p) => p.id === postId);
    if (!before) return;
    const optimistic = { hasLiked: !before.hasLiked, likeCount: before.likeCount + (before.hasLiked ? -1 : 1) };
    set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, ...optimistic } : p)) }));

    try {
      const result = await togglePostLike(postId);
      set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, ...result } : p)) }));
    } catch {
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, hasLiked: before.hasLiked, likeCount: before.likeCount } : p,
        ),
      }));
    }
  },

  /** Optimistic post creation. */
  addPost(postPayload) {
    const newPost = {
      id: crypto.randomUUID(),
      ...postPayload,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      hasLiked: false,
    };
    // Prepend to posts and re-order
    set((s) => ({ posts: order([newPost, ...s.posts], s.sort) }));
  },
}));
