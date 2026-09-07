"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Linkify from "react-linkify";

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

export default function PostDetailClient({ postId, inModal = false }) {
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
      {!inModal && (
        <Link href={`/${slug}/community`} className="btn btn-ghost self-start no-underline">
          <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
          Back to community
        </Link>
      )}

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
        <div className="mt-3 text-body-lg max-w-[70ch] break-words">
          <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="blank" href={decoratedHref} key={key} className="text-blue-600 hover:underline">
              {decoratedText}
            </a>
          )}>
            {post.content}
          </Linkify>
        </div>

        {/* Video Preview */}
        {post.videoUrl && (
          <div className="mt-6 border border-divider rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="block font-semibold text-zinc-900 mb-2">Attached Video</span>
              <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                {post.videoUrl}
              </a>
            </div>
          </div>
        )}

        {/* Attached Files */}
        {post.files && post.files.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {post.files.map((file, i) => (
              <div key={i} className="px-5 py-4 border border-divider rounded-lg bg-zinc-50 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                </span>
                <span className="font-medium text-zinc-900 truncate">{file}</span>
              </div>
            ))}
          </div>
        )}

        {/* Original videoPlaybackId logic (if needed for old mock data) */}
        {post.videoPlaybackId && !post.videoUrl ? (
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
