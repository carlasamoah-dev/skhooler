import "./globals.css";

export const metadata = {
  title: "Skool - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
