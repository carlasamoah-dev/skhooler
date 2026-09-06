import SettingsClient from "@/components/settings/SettingsClient";

export default async function Page({ params }) {
  const { tab } = await params;
  return <SettingsClient tab={tab} />;
}
