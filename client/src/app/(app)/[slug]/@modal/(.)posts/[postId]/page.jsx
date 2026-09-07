import PostDetailModalClient from "@/components/feed/PostDetailModalClient";

export default async function Page({ params }) {
  const { postId } = await params;
  return <PostDetailModalClient postId={postId} />;
}
