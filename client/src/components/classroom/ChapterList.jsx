"use client";

import { formatDuration } from "@/lib/format";

export default function ChapterList({ chapters = [], onSeek }) {
  if (chapters.length === 0) return null;

  return (
    <div className="bg-sand-100 rounded-inner p-5">
      <h4 className="text-[17px]">Chapters</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {chapters.map((chapter) => (
          <li key={chapter.at}>
            <button
              type="button"
              onClick={() => onSeek?.(chapter.at)}
              className="flex items-baseline gap-3 text-left w-full"
            >
              <span className="text-meta font-bold text-brand-700 tabular-nums shrink-0">
                {formatDuration(chapter.at)}
              </span>
              <span className="text-ui">{chapter.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
