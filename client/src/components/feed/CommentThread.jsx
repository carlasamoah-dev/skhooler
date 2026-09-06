"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { Avatar } from "@/components/ui";
import CommentComposer from "./CommentComposer";

function Comment({ comment, tinted, isReply, user, onLike, onReply }) {
  const [replying, setReplying] = useState(false);
  const name = `${comment.author.firstName} ${comment.author.lastName}`;

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
            onSubmit={async (content) => {
              await onReply?.(content, comment.id);
              setReplying(false);
            }}
          />
        </div>
      ) : null}
    </li>
  );
}

export default function CommentThread({ comments = [], user, onLike, onReply }) {
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
            />
            {repliesOf(root.id).map((reply) => (
              <Comment key={reply.id} comment={reply} tinted={row++ % 2 === 0} isReply user={user} onLike={onLike} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
