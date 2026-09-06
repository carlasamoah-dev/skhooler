import CommunityNavbar from "@/components/CommunityNavbar";

export default function CommunityLayout({ children }) {
  return (
    <>
      <CommunityNavbar />
      <main className="flex-1 w-full bg-app-bg min-h-screen">
        {children}
      </main>
    </>
  );
}
