import PublicProfileClient from "@/components/profile/PublicProfileClient";

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}
