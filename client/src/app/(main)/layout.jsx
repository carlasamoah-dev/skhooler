import GlobalNavbar from "@/components/GlobalNavbar";

export default function MainLayout({ children }) {
  return (
    <>
      <GlobalNavbar />
      <main className="flex-1 w-full bg-app-bg">
        {children}
      </main>
    </>
  );
}
