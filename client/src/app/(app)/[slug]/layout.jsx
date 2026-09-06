import AppShell from "@/components/shell/AppShell";

export default async function AppLayout({ children, params }) {
  const { slug } = await params;
  return <AppShell slug={slug}>{children}</AppShell>;
}
