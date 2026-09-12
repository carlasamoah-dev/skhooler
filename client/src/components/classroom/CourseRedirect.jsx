"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

import { fetchCourse } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { useCan } from "@/lib/permissions";
import { EmptyState, Skeleton } from "@/components/ui";
import CourseBuilderClient from "./CourseBuilderClient";

/** Admins see the builder. Students get redirected to the first lesson. */
export default function CourseRedirect({ courseSlug }) {
  const router = useRouter();
  const slug = useGroupStore((s) => s.slug);
  const can = useCan();
  const mayEdit = can("course:edit");
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchCourse(slug, courseSlug)
      .then((c) => {
        if (cancelled) return;
        const first = c.modules?.[0]?.lessons?.[0];
        
        if (!mayEdit && first) {
          router.replace(`/${slug}/classroom/${courseSlug}/${first.id}`);
        } else {
          setCourse(c);
        }
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [courseSlug, router, slug, mayEdit]);

  if (error) return <EmptyState icon={BookOpen} title="Course not found" body={error} />;

  if (course) {
    if (mayEdit) {
      return <CourseBuilderClient course={course} slug={slug} />;
    }

    return (
      <EmptyState
        icon={BookOpen}
        title={`${course.title} is empty`}
        body="This course doesn't have any published lessons yet."
      />
    );
  }

  return <Skeleton variant="card" className="h-[420px]" />;
}
