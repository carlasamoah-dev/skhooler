import CommunityDetailsClient from "@/components/CommunityDetailsClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: "Maker School: AI Automation",
    description: "Get your first client for an AI automation business in 90 days or your money back.",
  };
}

export default function CommunityDetailsPage() {
  return <CommunityDetailsClient />;
}
