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
    let cancelled = false;
    fetchCourse(courseSlug)
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
      // Create an empty modules array if null (which happens for mock courses other than the first)
      const courseWithModules = { ...course, modules: course.modules || [] };
      return <CourseBuilderClient course={courseWithModules} slug={slug} />;
    }

    return (
      <EmptyState
        icon={BookOpen}
        title={`${course.title} has no lessons loaded`}
        body="The mock data carries a module tree for one course only. The real API returns one for every course."
      />
    );
  }

  return <Skeleton variant="card" className="h-[420px]" />;
}
