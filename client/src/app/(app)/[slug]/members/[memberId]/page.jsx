import MemberProfileClient from "@/components/members/MemberProfileClient";

export const metadata = {
  title: "Member Profile — Skhooler",
};

export default async function Page({ params }) {
  const { memberId } = await params;
  return <MemberProfileClient memberId={memberId} />;
}
