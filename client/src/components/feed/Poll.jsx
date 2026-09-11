"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

function closesIn(expiresAt, now) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt) - now;
  if (ms <= 0) return "closed";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "closes in 1 day" : `closes in ${days} days`;
}

export default function Poll({ poll, onVote, readOnly = false }) {
  const [pending, setPending] = useState(null);
  // Read the clock once, at mount: calling it during render is impure and a
  // poll closing while the page is open is not worth a ticking timer.
  const [now] = useState(() => Date.now());
  const shown = pending ?? poll;
  const closed = shown.expiresAt && new Date(shown.expiresAt) <= now;
  const voted = new Set(shown.votedOptionIds);

  const share = (option) =>
    shown.totalVotes === 0 ? 0 : Math.round((option.voteCount / shown.totalVotes) * 100);

  const vote = async (optionId) => {
    if (closed || readOnly) return;
    const next = shown.allowMultiple
      ? voted.has(optionId)
        ? [...voted].filter((id) => id !== optionId)
        : [...voted, optionId]
      : voted.has(optionId)
        ? []
        : [optionId];

    // Show the new bars immediately; the server result replaces this.
    const optimistic = {
      ...shown,
      votedOptionIds: next,
      options: shown.options.map((o) => {
        const had = voted.has(o.id);
        const has = next.includes(o.id);
        if (had === has) return o;
        return { ...o, voteCount: o.voteCount + (has ? 1 : -1) };
      }),
      totalVotes:
        shown.totalVotes + (voted.size === 0 && next.length > 0 ? 1 : voted.size > 0 && next.length === 0 ? -1 : 0),
    };
    setPending(optimistic);

    try {
      const result = await onVote?.(next);
      setPending(result ?? null);
    } catch {
      setPending(null);
    }
  };

  return (
    <div className="bg-sand-100 rounded-inner px-[22px] py-5">
      <p className="text-base font-bold">{shown.question}</p>
      <p className="mt-1 text-meta text-sand-700">
        {[
          shown.allowMultiple ? "Pick any" : "Pick one",
          closesIn(shown.expiresAt, now),
          `${shown.totalVotes} votes`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {shown.options.map((option) => {
          const picked = voted.has(option.id);
          const percent = share(option);
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={closed}
                aria-pressed={picked}
                onClick={() => vote(option.id)}
                className="relative w-full overflow-hidden bg-surface rounded-chip px-[15px] py-[11px] text-left disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 transition-[width] duration-300",
                    picked ? "bg-brand-200" : "bg-sand-200",
                  )}
                  style={{ width: `${percent}%` }}
                />
                <span className="relative flex items-center gap-3 text-ui">
                  <span className="truncate">{option.text || option.label}</span>
                  <span className="ml-auto font-display font-extrabold">{`${percent}%`}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
