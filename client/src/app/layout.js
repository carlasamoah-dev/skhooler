import "./globals.css";

import AuthModalProvider from "@/components/AuthModalProvider";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "Skhooler - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

// Runs before first paint so a stored dark choice never flashes light first.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("skhooler-theme");
    var dark = stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-app-bg text-app-fg selection:bg-brand-primary selection:text-on-brand">
        <ThemeProvider>
          <AuthModalProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
