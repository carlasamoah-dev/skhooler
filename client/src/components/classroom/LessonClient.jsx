"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import { fetchCourse, fetchLesson, setLessonProgress } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { Card, EmptyState, Kicker, Skeleton } from "@/components/ui";
import ChapterList from "./ChapterList";
import LessonFooter from "./LessonFooter";
import LessonPlayer from "./LessonPlayer";
import LessonSidebar from "./LessonSidebar";
import ResourceList from "./ResourceList";

export default function LessonClient({ courseSlug, lessonId }) {
  const slug = useGroupStore((s) => s.slug);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);

  const hrefFor = useCallback(
    (id) => `/${slug}/classroom/${courseSlug}/${id}`,
    [slug, courseSlug],
  );

  useEffect(() => {
    let cancelled = false;
    fetchCourse(courseSlug)
      .then((c) => !cancelled && setCourse(c))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [courseSlug]);

  useEffect(() => {
    if (!lessonId) return undefined;
    let cancelled = false;
    fetchLesson(lessonId)
      .then((l) => !cancelled && setLesson(l))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (error) {
    return <EmptyState icon={BookOpen} title="Lesson not found" body={error} />;
  }

  // The seed carries a module tree for one course only; say so rather than fake it.
  if (course && course.modules === null) {
    return (
      <EmptyState
        icon={BookOpen}
        title={`${course.title} has no lessons loaded`}
        body="The mock data carries a module tree for one course only. The real API returns one for every course."
      />
    );
  }

  // The held lesson belongs to the previous id until the new one arrives.
  const ready = course && lesson?.id === lessonId;

  if (!ready) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5">
        <Skeleton variant="card" className="h-[420px]" />
        <Skeleton variant="card" className="h-[420px]" />
      </div>
    );
  }

  const toggleComplete = async (next) => {
    setLesson((l) => ({ ...l, progress: { ...l.progress, isCompleted: next } }));
    const result = await setLessonProgress(lessonId, next);
    // Re-read the course so the module counts and the progress bar follow.
    const refreshed = await fetchCourse(courseSlug);
    setCourse(refreshed);
    setLesson((l) => ({ ...l, progress: { ...l.progress, isCompleted: result.isCompleted } }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5">
      <LessonSidebar course={course} activeLessonId={lessonId} slug={slug} hrefFor={hrefFor} />

      <div className="min-w-0 flex flex-col gap-5">
        <LessonPlayer durationSeconds={lesson.videoDurationSeconds} title={lesson.title} />

        <Card padding={32} radius="panel" className="px-[34px] py-[30px]">
          <Kicker>{`${lesson.moduleTitle} · Lesson ${lesson.lessonNumber}`}</Kicker>
          <h3 className="mt-1">{lesson.title}</h3>
          {lesson.content ? <p className="mt-3 text-body-lg max-w-[68ch]">{lesson.content}</p> : null}

          {lesson.chapters.length > 0 || lesson.attachments.length > 0 ? (
            <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <ChapterList chapters={lesson.chapters} />
              <ResourceList attachments={lesson.attachments} />
            </div>
          ) : null}

          <LessonFooter
            isCompleted={!!lesson.progress?.isCompleted}
            onToggleComplete={toggleComplete}
            lastPositionSeconds={lesson.progress?.lastPositionSeconds ?? 0}
            previousHref={lesson.previousLessonId ? hrefFor(lesson.previousLessonId) : null}
            nextHref={lesson.nextLessonId ? hrefFor(lesson.nextLessonId) : null}
          />
        </Card>
      </div>
    </div>
  );
}
