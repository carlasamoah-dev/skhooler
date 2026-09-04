import "./globals.css";

export const metadata = {
  title: "Skool - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

import AuthModalProvider from "@/components/AuthModalProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <AuthModalProvider />
        {children}
      </body>
    </html>
  );
}
