"use client";

import { Plus } from "lucide-react";

import CourseCard from "./CourseCard";

export default function CourseGrid({ courses = [], slug, canCreate, onCreate }) {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} href={`/${slug}/classroom/${course.slug}`} />
      ))}

      {canCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="min-h-[280px] rounded-panel border-2 border-dashed border-divider text-sand-700 hover:text-ink hover:border-sand-400 flex items-center justify-center gap-2 font-display font-extrabold"
        >
          <Plus className="lucide w-5 h-5" aria-hidden="true" />
          New course
        </button>
      ) : null}
    </div>
  );
}
