import LessonRow from "./LessonRow";

function stateOf(lesson, activeLessonId) {
  if (lesson.id === activeLessonId) return "current";
  return lesson.progress?.isCompleted ? "complete" : "todo";
}

function badgeOf(lesson) {
  if (!lesson.isPublished) return "Draft";
  if (lesson.isFreePreview) return "Free preview";
  return null;
}

export default function ModuleGroup({ group, activeLessonId, hrefFor }) {
  const done = group.lessons.filter((l) => l.progress?.isCompleted).length;

  return (
    <section className="mt-5">
      <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.06em] text-sand-700">
        <span className="truncate">{group.title}</span>
        <span className="ml-auto shrink-0">{`${done} of ${group.lessons.length}`}</span>
      </h3>
      <ul className="mt-2 flex flex-col gap-0.5">
        {group.lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            state={stateOf(lesson, activeLessonId)}
            badge={badgeOf(lesson)}
            href={hrefFor(lesson.id)}
          />
        ))}
      </ul>
    </section>
  );
}
