import Link from "next/link";

import { Card, ProgressBar, StatusDot } from "@/components/ui";

const ACCESS = {
  OPEN: { tone: "sage", label: "Open to all members" },
  TIER_LOCKED: { tone: "brand", label: "VIP tier only" },
  PRIVATE_GRANT: { tone: "neutral", label: "Granted access only" },
};

export default function CourseCard({ course, href }) {
  const access = ACCESS[course.accessType] ?? ACCESS.OPEN;

  return (
    <Card as="article" padding={18} radius="panel" className="relative overflow-hidden p-0 flex flex-col">
      {/* 16:9 cover. No asset yet, so it renders as a washed brand field. */}
      <div
        aria-hidden="true"
        className="aspect-video w-full bg-brand-300"
        style={{ filter: "saturate(.85) contrast(.95)" }}
      />

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
          <ProgressBar percent={course.progressPercent} height={10} label={`${course.title} progress`} />
          <p className="mt-2 text-meta text-sand-700">
            {`${course.progressPercent}% complete`}
          </p>
          <p className="text-meta text-sand-700">
            {`${course.moduleCount} modules · ${course.lessonCount} lessons`}
          </p>
        </div>
      </div>
    </Card>
  );
}
