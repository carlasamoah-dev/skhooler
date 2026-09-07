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
import Linkify from "react-linkify";

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

      <div className="mt-2 text-base text-sand-800 max-w-[70ch] line-clamp-2 break-words relative z-10">
        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
          <a target="blank" href={decoratedHref} key={key} className="text-blue-600 hover:underline relative z-20">
            {decoratedText}
          </a>
        )}>
          {post.content}
        </Linkify>
      </div>

      {/* Render Video Preview */}
      {post.videoUrl && (
        <div className="mt-4 border border-divider rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center p-6">
          <div className="text-center">
            <span className="block font-semibold text-zinc-900 mb-1">Attached Video</span>
            <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-brand text-sm hover:underline">
              {post.videoUrl}
            </a>
          </div>
        </div>
      )}

      {/* Render Attached Files */}
      {post.files && post.files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {post.files.map((file, i) => (
            <div key={i} className="px-4 py-3 border border-divider rounded-lg bg-zinc-50 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              </span>
              <span className="text-sm font-medium text-zinc-900 truncate">{file}</span>
            </div>
          ))}
        </div>
      )}

      {/* Render Poll */}
      {post.poll && post.poll.length > 0 && (
        <div className="mt-4 border border-divider rounded-xl p-4">
          <span className="font-bold text-zinc-900 block mb-3">Poll</span>
          <div className="flex flex-col gap-2">
            {post.poll.map((opt, i) => (
              <div key={i} className="w-full h-10 border border-zinc-200 rounded-md flex items-center px-4 cursor-pointer hover:bg-zinc-50 transition-colors">
                <div className="w-4 h-4 rounded-full border border-zinc-300 mr-3 shrink-0"></div>
                <span className="text-zinc-700 text-sm">{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
