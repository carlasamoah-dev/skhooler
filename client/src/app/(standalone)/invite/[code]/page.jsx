import InviteRedirectClient from "@/components/InviteRedirectClient";

export async function generateMetadata() {
  return { title: "Join Community — Skhooler" };
}

export default async function InvitePage({ params }) {
  const { code } = await params;
  return (
    <div className="min-h-screen bg-ground flex flex-col">
      <div className="max-w-[600px] mx-auto w-full px-6 py-20">
        <InviteRedirectClient code={code} />
      </div>
    </div>
  );
}
