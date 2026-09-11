import NavigationRail from "@/components/shell/NavigationRail";
import AppShell from "@/components/shell/AppShell";

export default async function AppLayout({ children, modal, params }) {
  const { slug } = await params;
  return (
    <div className="flex h-full overflow-hidden">
      <NavigationRail />
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <AppShell slug={slug}>
          {children}
          {modal}
        </AppShell>
      </div>
    </div>
  );
}
