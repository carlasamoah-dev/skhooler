import PostDetailClient from "@/components/feed/PostDetailClient";

export default async function Page({ params }) {
  const { postId } = await params;
  return <PostDetailClient postId={postId} />;
}
