import CommunityNavbar from "@/components/CommunityNavbar";

export default function CommunityLandingLayout({ children }) {
  return (
    <>
      <CommunityNavbar />
      <main className="flex-1 w-full bg-ground min-h-screen">
        {children}
      </main>
    </>
  );
}
