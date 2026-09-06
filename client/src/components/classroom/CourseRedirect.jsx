"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

import { fetchCourse } from "@/lib/api";
import { useGroupStore } from "@/store/useGroupStore";
import { EmptyState, Skeleton } from "@/components/ui";

/** A course opens at its first lesson; there is no separate course screen. */
export default function CourseRedirect({ courseSlug }) {
  const router = useRouter();
  const slug = useGroupStore((s) => s.slug);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourse(courseSlug)
      .then((c) => {
        if (cancelled) return;
        const first = c.modules?.[0]?.lessons?.[0];
        if (first) router.replace(`/${slug}/classroom/${courseSlug}/${first.id}`);
        else setCourse(c);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [courseSlug, router, slug]);

  if (error) return <EmptyState icon={BookOpen} title="Course not found" body={error} />;

  if (course) {
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
