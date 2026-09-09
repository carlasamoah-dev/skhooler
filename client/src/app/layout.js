import "./globals.css";
import AuthModalProvider from "@/components/AuthModalProvider";
import SessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "Skhooler - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-screen flex flex-col bg-ground text-ink overflow-hidden">
        <SessionProvider>
          <AuthModalProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
