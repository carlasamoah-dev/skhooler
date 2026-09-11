import CommunityDetailsClient from "@/components/CommunityDetailsClient";
import { fetchGroupBundle } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await fetchGroupBundle(slug).catch(() => null);

  if (!bundle) {
    return { title: "Community Not Found · Skhooler" };
  }

  const { group } = bundle;
  return {
    title: group.name,
    description: group.description,
    openGraph: {
      title: `${group.name} · Skhooler`,
      description: group.description,
      images: group.coverUrl ? [{ url: group.coverUrl }] : [],
    },
  };
}

export default function CommunityDetailsPage() {
  return <CommunityDetailsClient />;
}
