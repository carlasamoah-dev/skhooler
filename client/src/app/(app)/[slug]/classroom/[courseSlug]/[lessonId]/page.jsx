import LessonClient from "@/components/classroom/LessonClient";

export default async function Page({ params }) {
  const { courseSlug, lessonId } = await params;
  return <LessonClient courseSlug={courseSlug} lessonId={lessonId} />;
}
