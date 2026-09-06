import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";

import { formatCount, relativeTime } from "@/lib/format";
import { Card } from "@/components/ui";
import PostHeader from "./PostHeader";

/**
 * The whole card navigates to the post. Rather than wrapping the card in an
 * anchor — which would swallow the action button and give the card two nested
 * interactive elements — the title link is stretched across the card, leaving
 * one focusable target plus the action button.
 */
export default function PostCard({ post, href }) {
  return (
    <Card as="article" padding={24} radius="panel" className="relative px-[26px]">
      <PostHeader
        author={post.author}
        createdAt={post.createdAt}
        category={post.category}
        isPinned={post.isPinned}
      />

      <h3 className="mt-4">
        <Link href={href} className="no-underline text-ink before:absolute before:inset-0 before:content-['']">
          <span className="line-clamp-2">{post.title}</span>
        </Link>
      </h3>

      <p className="mt-2 text-base text-sand-800 max-w-[70ch] line-clamp-2">{post.content}</p>

      {post.actionButtonText ? (
        <a
          href={post.actionButtonUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-primary relative mt-4 no-underline"
        >
          {post.actionButtonText}
        </a>
      ) : null}

      <div className="mt-5 flex items-center gap-5 text-ui text-sand-800">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="lucide w-4 h-4" aria-hidden="true" />
          {formatCount(post.likeCount)}
          <span className="sr-only">likes</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="lucide w-4 h-4" aria-hidden="true" />
          {formatCount(post.commentCount)}
          <span className="sr-only">comments</span>
        </span>
        {post.lastCommentAt ? (
          <span className="text-meta text-sand-700">{`new comment ${relativeTime(post.lastCommentAt)}`}</span>
        ) : null}
      </div>
    </Card>
  );
}
