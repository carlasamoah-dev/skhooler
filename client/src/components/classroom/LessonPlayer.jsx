import { formatDuration } from "@/lib/format";

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null; // Not an embed, assume direct link
}

export default function LessonPlayer({ durationSeconds, title, videoUrl }) {
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div
      role="img"
      aria-label={`Video for ${title}`}
      className="relative aspect-video w-full rounded-panel bg-video overflow-hidden"
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sand-500">
          No video provided
        </div>
      )}
      
      {(!videoUrl && durationSeconds > 0) && (
        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-chip bg-ink/70 text-ground text-meta font-semibold z-10 pointer-events-none">
          {formatDuration(durationSeconds)}
        </span>
      )}
    </div>
  );
}
