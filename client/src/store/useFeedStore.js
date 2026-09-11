import { create } from "zustand";

import { fetchPosts, togglePostLike } from "@/lib/api";
import { useGroupStore } from "./useGroupStore";

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
    const slug = useGroupStore.getState().slug;
    if (!slug) return;

    const requestId = get().requestId + 1;
    set({ requestId, status: "loading", error: null, posts: [], cursor: null });
    try {
      const { items, nextCursor } = await fetchPosts(slug, { categoryId: get().filterCategoryId, sort: get().sort });
      if (get().requestId !== requestId) return;
      set({ posts: items, cursor: nextCursor, status: "ready" });
    } catch (error) {
      if (get().requestId !== requestId) return;
      set({ status: "error", error: error?.message ?? "Could not load the feed." });
    }
  },

  async loadMore() {
    const { cursor, status, filterCategoryId, sort, requestId } = get();
    if (!cursor || status === "loading" || status === "loadingMore") return;

    const slug = useGroupStore.getState().slug;
    if (!slug) return;

    set({ status: "loadingMore" });
    try {
      const { items, nextCursor } = await fetchPosts(slug, { cursor, categoryId: filterCategoryId, sort });
      if (get().requestId !== requestId) return;
      set((s) => ({ posts: [...s.posts, ...items], cursor: nextCursor, status: "ready" }));
    } catch (error) {
      if (get().requestId !== requestId) return;
      set({ status: "error", error: error?.message ?? "Could not load more posts." });
    }
  },

  setCategory(filterCategoryId) {
    set({ filterCategoryId });
    get().load();
  },

  setSort(sort) {
    set({ sort });
    get().load();
  },

  /** Optimistic like toggle, reverted if the write fails. */
  async toggleLike(postId) {
    const slug = useGroupStore.getState().slug;
    const before = get().posts.find((p) => p.id === postId);
    if (!before || !slug) return;
    const optimistic = { hasLiked: !before.hasLiked, likeCount: before.likeCount + (before.hasLiked ? -1 : 1) };
    set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, ...optimistic } : p)) }));

    try {
      const result = await togglePostLike(slug, postId);
      set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, ...result } : p)) }));
    } catch {
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, hasLiked: before.hasLiked, likeCount: before.likeCount } : p,
        ),
      }));
    }
  },

  /** Refresh the feed from the server after creating a post. */
  async refresh() {
    const requestId = get().requestId + 1;
    set({ requestId });
    get().load();
  },

  /** Real-time updates */
  updatePost(postId, patch) {
    set((s) => {
      const updated = s.posts.map((p) => (p.id === postId ? { ...p, ...patch } : p));
      return { posts: order(updated, s.sort) };
    });
  },

  addPost(post) {
    set((s) => {
      // Don't add if already exists or doesn't match current category filter
      if (s.posts.find(p => p.id === post.id)) return s;
      if (s.filterCategoryId && post.categoryId !== s.filterCategoryId) return s;
      return { posts: order([post, ...s.posts], s.sort) };
    });
  }
}));
