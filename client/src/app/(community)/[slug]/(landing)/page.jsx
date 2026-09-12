import CommunityDetailsClient from "@/components/CommunityDetailsClient";
import { fetchGroupBundle } from "@/lib/api";
import CommunityNavbar from "@/components/CommunityNavbar";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await fetchGroupBundle(slug).catch(() => null);

  if (!bundle) return { title: "Not Found" };

  return {
    title: `${bundle.group.name} - Community`,
    description: bundle.group.description || `Join ${bundle.group.name}`,
    openGraph: {
      images: bundle.group.coverUrl ? [bundle.group.coverUrl] : [],
    },
  };
}

export default async function CommunityDetailsPage({ params }) {
  const { slug } = await params;
  const bundle = await fetchGroupBundle(slug).catch(() => null);

  if (!bundle) {
    return <div className="p-20 text-center text-xl">Community Not Found</div>;
  }

  return (
    <>
      <CommunityNavbar group={bundle.group} />
      <CommunityDetailsClient group={bundle.group} />
    </>
  );
}
