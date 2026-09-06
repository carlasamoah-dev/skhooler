import { formatDuration } from "@/lib/format";

/**
 * The seed carries a playback id, not a stream, so this is the video well the
 * design specifies with its duration label. Dropping a player in later means
 * replacing the inner element only.
 */
export default function LessonPlayer({ durationSeconds, title }) {
  return (
    <div
      role="img"
      aria-label={`Video for ${title}`}
      className="relative aspect-video w-full rounded-panel bg-video"
    >
      <span className="absolute bottom-3 right-3 px-2 py-1 rounded-chip bg-ink/70 text-ground text-meta font-semibold">
        {formatDuration(durationSeconds)}
      </span>
    </div>
  );
}
