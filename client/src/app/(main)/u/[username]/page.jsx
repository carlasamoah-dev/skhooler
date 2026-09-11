import PublicProfileClient from "@/components/profile/PublicProfileClient";
import { fetchUserProfile } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const profile = await fetchUserProfile(username).catch(() => null);
  
  if (!profile) {
    return { title: "Profile Not Found · Skhooler" };
  }

  const name = `${profile.firstName} ${profile.lastName}`;
  return {
    title: `${name} (@${profile.username})`,
    description: `See ${name}'s profile and communities on Skhooler.`,
    openGraph: {
      title: `${name} (@${profile.username})`,
      description: `See ${name}'s profile and communities on Skhooler.`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
    },
  };
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  return <PublicProfileClient username={username} />;
}
