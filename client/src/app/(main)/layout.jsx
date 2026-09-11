import NavigationRail from "@/components/shell/NavigationRail";
import GlobalNavbar from "@/components/GlobalNavbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-full overflow-hidden">
      <NavigationRail />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <GlobalNavbar />
        <main className="flex-1 overflow-y-auto bg-ground pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
