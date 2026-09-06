import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, ProgressBar } from "@/components/ui";
import ModuleGroup from "./ModuleGroup";

export default function LessonSidebar({ course, activeLessonId, slug, hrefFor }) {
  return (
    <Card padding={18} radius="panel" className="self-start p-[22px]">
      <Link href={`/${slug}/classroom`} className="btn btn-ghost -ml-2.5 no-underline">
        <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
        All courses
      </Link>

      <h2 className="text-[19px] mt-3">{course.title}</h2>
      <p className="text-meta text-sand-700">{`${course.moduleCount} modules · ${course.lessonCount} lessons`}</p>

      <div className="mt-3">
        <ProgressBar percent={course.progressPercent} height={10} label={`${course.title} progress`} />
      </div>

      <nav aria-label="Lessons">
        {course.modules.map((group) => (
          <ModuleGroup key={group.id} group={group} activeLessonId={activeLessonId} hrefFor={hrefFor} />
        ))}
      </nav>
    </Card>
  );
}
