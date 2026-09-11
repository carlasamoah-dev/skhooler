"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { Avatar } from "@/components/ui";
import CommentComposer from "./CommentComposer";
import { useGroupStore } from "@/store/useGroupStore";
import { useSocketStore } from "@/store/useSocketStore";

function Comment({ comment, tinted, isReply, user, onLike, onReply, typingUsers = [], postId }) {
  const [replying, setReplying] = useState(false);
  const name = `${comment.author.firstName} ${comment.author.lastName}`;

  // Find who is typing on this specific comment
  const typists = typingUsers.filter(u => u.parentCommentId === comment.id);

  return (
    <li className={cn(isReply && "ml-11")}>
      <div className={cn("rounded-inner px-5 py-4", tinted ? "bg-sand-100" : "bg-ground")}>
        <div className="flex items-center gap-3">
          <Avatar name={name} src={comment.author.avatarUrl ?? undefined} size={32} />
          <p className="text-ui">
            <span className="font-semibold">{name}</span>
            <span className="text-sand-700">{` · ${relativeTime(comment.createdAt)}`}</span>
          </p>
        </div>

        <p className="mt-2 text-body max-w-[66ch]">{comment.content}</p>

        <div className="mt-3 flex items-center gap-4 text-meta">
          <button
            type="button"
            aria-pressed={comment.hasLiked}
            onClick={() => onLike?.(comment.id)}
            className={cn("font-semibold", comment.hasLiked ? "text-brand-700" : "text-sand-700 hover:text-ink")}
          >
            {`Like · ${comment.likeCount}`}
          </button>
          {/* Only top-level comments offer a reply: the thread is one level deep. */}
          {isReply ? null : (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="font-semibold text-sand-700 hover:text-ink"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {replying ? (
        <div className="mt-2 ml-11">
          <CommentComposer
            user={user}
            size={32}
            placeholder={`Reply to ${comment.author.firstName}…`}
            onTyping={(isTyping) => {
              const groupId = useGroupStore.getState().group?.id;
              const typistName = user ? `${user.firstName} ${user.lastName}` : "Someone";
              useSocketStore.getState().emitTyping(groupId, postId, comment.id, typistName, isTyping);
            }}
            onSubmit={async (content) => {
              await onReply?.(content, comment.id);
              setReplying(false);
            }}
          />
        </div>
      ) : null}

      {/* Reply Typing Indicator */}
      {!isReply && typists.length > 0 && (
        <div className="mt-2 ml-11 flex items-center gap-2 text-xs text-sand-500 animate-pulse">
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-1 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-1 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
          {typists.map(u => u.name).join(", ")} {typists.length === 1 ? "is" : "are"} typing a reply...
        </div>
      )}
    </li>
  );
}

export default function CommentThread({ comments = [], user, onLike, onReply, typingUsers = [], postId }) {
  const roots = comments.filter((c) => !c.parentCommentId);
  const repliesOf = (id) => comments.filter((c) => c.parentCommentId === id);

  let row = 0;
  return (
    <ul className="flex flex-col gap-2">
      {roots.map((root) => (
        <li key={root.id}>
          <ul className="flex flex-col gap-2">
            <Comment
              comment={root}
              tinted={row++ % 2 === 0}
              user={user}
              onLike={onLike}
              onReply={onReply}
              typingUsers={typingUsers}
              postId={postId}
            />
            {repliesOf(root.id).map((reply) => (
              <Comment 
                key={reply.id} 
                comment={reply} 
                tinted={row++ % 2 === 0} 
                isReply 
                user={user} 
                onLike={onLike} 
                postId={postId}
              />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
