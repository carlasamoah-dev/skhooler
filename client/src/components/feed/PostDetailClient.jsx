"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  createComment,
  fetchComments,
  fetchPost,
  toggleCommentLike,
  togglePostLike,
  togglePostPin,
  votePoll,
} from "@/lib/api";
import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { Button, Card, Checkbox, Skeleton } from "@/components/ui";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";
import Poll from "./Poll";
import PostHeader from "./PostHeader";

export default function PostDetailClient({ postId }) {
  const can = useCan();
  const { slug, user } = useGroupStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchPost(postId)
      .then((p) => !cancelled && setPost(p))
      .catch((e) => !cancelled && setError(e.message));
    fetchComments(postId).then((c) => !cancelled && setComments(c.items));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (error) {
    return (
      <div className="mx-auto max-w-[860px]">
        <h1>Post not found</h1>
        <p className="mt-2 text-body text-sand-800">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[860px] flex flex-col gap-4">
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  const like = async () => {
    const before = { hasLiked: post.hasLiked, likeCount: post.likeCount };
    setPost((p) => ({ ...p, hasLiked: !p.hasLiked, likeCount: p.likeCount + (p.hasLiked ? -1 : 1) }));
    try {
      const result = await togglePostLike(postId);
      setPost((p) => ({ ...p, ...result }));
    } catch {
      setPost((p) => ({ ...p, ...before }));
    }
  };

  const addComment = async (content, parentCommentId = null) => {
    const comment = await createComment(postId, { content, parentCommentId });
    setComments((list) => [...list, comment]);
    setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
  };

  const likeComment = async (commentId) => {
    setComments((list) =>
      list.map((c) =>
        c.id === commentId ? { ...c, hasLiked: !c.hasLiked, likeCount: c.likeCount + (c.hasLiked ? -1 : 1) } : c,
      ),
    );
    const result = await toggleCommentLike(commentId);
    setComments((list) => list.map((c) => (c.id === commentId ? { ...c, ...result } : c)));
  };

  return (
    <div className="mx-auto max-w-[860px] flex flex-col gap-4">
      <Link href={`/${slug}/community`} className="btn btn-ghost self-start no-underline">
        <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
        Back to community
      </Link>

      <Card as="article" padding={32} radius="overlay" className="px-9">
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          category={post.category}
          isPinned={post.isPinned}
          size={48}
          showRole
        />

        <h2 className="mt-5">{post.title}</h2>
        <p className="mt-3 text-body-lg max-w-[70ch]">{post.content}</p>

        {post.videoPlaybackId ? (
          <div
            className="mt-6 aspect-video w-full rounded-inner bg-video"
            role="img"
            aria-label="Video for this post"
          />
        ) : null}

        {post.poll ? (
          <div className="mt-6">
            <Poll poll={post.poll} onVote={(optionIds) => votePoll(postId, optionIds)} />
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button variant="secondary" aria-pressed={post.hasLiked} onClick={like}>
            {`Like · ${formatCount(post.likeCount)}`}
          </Button>
          <span className="text-ui text-sand-700">{`${formatCount(post.commentCount)} comments`}</span>

          {can("post:pin") ? (
            <Checkbox
              className="ml-auto"
              label="Pinned to the top of the feed"
              checked={post.isPinned}
              onChange={async () => {
                setPost((p) => ({ ...p, isPinned: !p.isPinned }));
                const result = await togglePostPin(postId);
                setPost((p) => ({ ...p, ...result }));
              }}
            />
          ) : null}
        </div>
      </Card>

      <Card padding={32} radius="overlay" className="px-9 py-7">
        <CommentComposer user={user} onSubmit={(content) => addComment(content)} />
        <div className="mt-5">
          <CommentThread comments={comments} user={user} onLike={likeComment} onReply={addComment} />
        </div>
      </Card>
    </div>
  );
}
