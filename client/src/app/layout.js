import "./globals.css";
import AuthModalProvider from "@/components/AuthModalProvider";
import SessionProvider from "@/components/SessionProvider";
import NavigationRail from "@/components/shell/NavigationRail";

export const metadata = {
  title: "Skhooler - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-screen flex bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-hidden">
        <SessionProvider>
          <AuthModalProvider />
          <NavigationRail />
          <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
