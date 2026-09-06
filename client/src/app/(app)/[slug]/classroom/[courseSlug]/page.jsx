import CourseRedirect from "@/components/classroom/CourseRedirect";

export default async function Page({ params }) {
  const { courseSlug } = await params;
  return <CourseRedirect courseSlug={courseSlug} />;
}
