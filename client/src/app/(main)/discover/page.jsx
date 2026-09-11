import DiscoverClient from "@/components/DiscoverClient";

export const metadata = {
  title: "Discover Communities",
  description:
    "Explore thousands of online communities for creators, learners, and builders. Find your tribe on Skhooler.",
  openGraph: {
    title: "Discover Communities · Skhooler",
    description: "Explore thousands of online communities for creators, learners, and builders.",
  },
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}
