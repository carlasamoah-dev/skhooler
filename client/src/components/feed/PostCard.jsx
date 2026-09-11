import Link from "next/link";
import { MessageCircle, ThumbsUp } from "lucide-react";

import { formatCount, relativeTime } from "@/lib/format";
import { votePoll } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { Card } from "@/components/ui";
import PostHeader from "./PostHeader";
import Poll from "./Poll";

/**
 * The whole card navigates to the post. Rather than wrapping the card in an
 * anchor — which would swallow the action button and give the card two nested
 * interactive elements — the title link is stretched across the card, leaving
 * one focusable target plus the action button.
 */
import Linkify from "react-linkify";

export default function PostCard({ post, href }) {
  const slug = useGroupStore((s) => s.slug);
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

      {/* Render Video */}
      {post.videoUrl && (() => {
        let embedUrl = null;
        try {
          const u = new URL(post.videoUrl);
          if (u.hostname === "youtu.be") embedUrl = `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
          else if (u.hostname.includes("youtube.com")) { const v = u.searchParams.get("v"); if (v) embedUrl = `https://www.youtube.com/embed/${v}`; }
          else if (u.hostname.includes("vimeo.com")) { const id = u.pathname.split("/").filter(Boolean).pop(); if (id) embedUrl = `https://player.vimeo.com/video/${id}`; }
          else if (u.hostname.includes("loom.com") && u.pathname.includes("/share/")) { const id = u.pathname.split("/").pop(); if (id) embedUrl = `https://www.loom.com/embed/${id}`; }
        } catch {}
        if (embedUrl) {
          return (
            <div className="mt-4 aspect-video w-full rounded-inner overflow-hidden bg-black relative z-10">
              <iframe src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" title="Video" />
            </div>
          );
        }
        
        // If it's a Supabase storage URL (meaning it's an uploaded file) or ends with a video extension
        const isUploadedMedia = post.videoUrl.includes('supabase.co') || post.videoUrl.match(/\.(mp4|webm|ogg|mov)$/i);
        
        if (isUploadedMedia) {
          return (
            <div className="mt-4 aspect-video w-full rounded-inner overflow-hidden bg-black relative z-10">
              <video src={post.videoUrl} controls className="w-full h-full" playsInline preload="metadata" />
            </div>
          );
        }

        return (
          <div className="mt-4 border border-divider rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center p-4 relative z-10">
            <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-brand text-sm hover:underline truncate">{post.videoUrl}</a>
          </div>
        );
      })()}

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
      {post.poll ? (
        <div className="mt-4 relative z-20 pointer-events-none">
          <Poll
            poll={{ ...post.poll, votedOptionIds: post.userVotedOptionIds ?? [] }}
            readOnly
          />
        </div>
      ) : null}

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
