"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import { useCan } from "@/lib/permissions";
import { useFeedStore } from "@/store/useFeedStore";
import { useGroupStore } from "@/store/useGroupStore";
import { EmptyState, Skeleton } from "@/components/ui";
import CategoryFilter from "./CategoryFilter";
import ComposerBar from "./ComposerBar";
import ComposerModal from "./ComposerModal";
import FeedSidebar from "./FeedSidebar";
import PostCard from "./PostCard";
import SortSelect from "./SortSelect";

export default function FeedClient() {
  const can = useCan();
  const { slug, group, categories, user } = useGroupStore();
  const { posts, cursor, sort, filterCategoryId, status, error, load, loadMore, setCategory, setSort } =
    useFeedStore();
  const sentinelRef = useRef(null);

  useEffect(() => {
    load();
  }, [load]);

  // Pull the next page in when the sentinel below the list comes into view.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, cursor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
      <div className="flex flex-col gap-4">
        {can("post:create") ? (
          <>
            <ComposerBar user={user} slug={slug} />
            <ComposerModal />
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <CategoryFilter categories={categories} activeId={filterCategoryId} onChange={setCategory} />
          <div className="ml-auto">
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
            {error}
          </p>
        ) : null}

        {status === "loading" ? (
          <div className="flex flex-col gap-4">
            <Skeleton variant="card" count={3} />
          </div>
        ) : null}

        {status !== "loading" && posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No posts yet"
            body={
              filterCategoryId
                ? "Nothing in this category so far. Try another one."
                : "When someone posts, it will show up here."
            }
          />
        ) : null}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} href={`/${slug}/posts/${post.id}`} />
        ))}

        <div ref={sentinelRef} aria-hidden="true" className="h-px" />
        {status === "loadingMore" ? <Skeleton variant="card" /> : null}
      </div>

      {group ? <FeedSidebar group={group} /> : null}
    </div>
  );
}
