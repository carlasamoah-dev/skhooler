import JoinPage from "@/components/join/JoinPage";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `Join — Skhooler`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <JoinPage slug={slug} />;
}
