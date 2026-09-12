import Link from "next/link";

import { Card, ProgressBar, StatusDot } from "@/components/ui";

const ACCESS = {
  OPEN: { tone: "sage", label: "Open to all members" },
  TIER_LOCKED: { tone: "brand", label: "Tier locked" },
  PRIVATE_GRANT: { tone: "neutral", label: "Invite only" },
};

export default function CourseCard({ course, href }) {
  const access = ACCESS[course.accessType] ?? ACCESS.OPEN;
  // Backend returns progressPercentage; mock used progressPercent — handle both
  const progress = course.progressPercentage ?? course.progressPercent ?? 0;
  // Backend returns lessonsCount; mock used lessonCount — handle both
  const lessonCount = course.lessonsCount ?? course.lessonCount ?? 0;
  const moduleCount = course._count?.modules ?? course.moduleCount ?? 0;

  return (
    <Card as="article" padding={18} radius="panel" className="relative overflow-hidden p-0 flex flex-col">
      {/* 16:9 cover image */}
      <div
        aria-hidden="true"
        className="relative aspect-video w-full bg-brand-300 overflow-hidden"
      >
        {course.coverUrl ? (
          <>
            <img
              src={course.coverUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* subtle gradient so text stays legible if overlaid */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-300" style={{ filter: "saturate(.85) contrast(.95)" }} />
        )}
      </div>

      <div className="p-[22px] flex flex-col flex-1">
        <StatusDot tone={access.tone} label={access.label} />

        <h4 className="text-[21px] mt-2">
          <Link href={href} className="no-underline text-ink before:absolute before:inset-0 before:content-['']">
            {course.title}
          </Link>
        </h4>

        <p className="mt-1.5 text-ui text-sand-800">{course.description}</p>

        {course.isPublished ? null : (
          <p className="mt-3 text-kicker font-bold text-brand-700">
            Draft — members can&apos;t see this yet
          </p>
        )}

        <div className="mt-auto pt-5">
          <ProgressBar percent={progress} height={10} label={`${course.title} progress`} />
          <p className="mt-2 text-meta text-sand-700">
            {`${progress}% complete`}
          </p>
          <p className="text-meta text-sand-700">
            {`${moduleCount} module${moduleCount !== 1 ? "s" : ""} · ${lessonCount} lesson${lessonCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
    </Card>
  );
}
