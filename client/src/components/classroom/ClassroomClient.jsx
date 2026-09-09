"use client";

import { useEffect, useState } from "react";

import { fetchCourses } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { Button, Skeleton } from "@/components/ui";
import CourseGrid from "./CourseGrid";
import NewCourseModal from "./NewCourseModal";

export default function ClassroomClient() {
  const can = useCan();
  const slug = useGroupStore((s) => s.slug);
  const [courses, setCourses] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCourses().then((c) => !cancelled && setCourses(c));
    return () => { cancelled = true; };
  }, []);

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...(prev || [])]);
  };

  if (!courses) {
    return (
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <Skeleton variant="card" count={3} className="h-[320px]" />
      </div>
    );
  }

  const lessonTotal = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div>
          <h2>Classroom</h2>
          <p className="text-meta text-sand-700">{`${courses.length} course${courses.length !== 1 ? "s" : ""} · ${lessonTotal} lesson${lessonTotal !== 1 ? "s" : ""}`}</p>
        </div>
        {can("course:create") ? (
          <Button className="ml-auto" onClick={() => setShowNewModal(true)}>
            New course
          </Button>
        ) : null}
      </div>

      <CourseGrid courses={courses} slug={slug} canCreate={can("course:create")} />

      <NewCourseModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleCourseCreated}
      />
    </>
  );
}
