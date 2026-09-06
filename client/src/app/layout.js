import { Manrope, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import AuthModalProvider from "@/components/AuthModalProvider";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "Skhooler - Discover Communities",
  description: "Find and join communities of like-minded people. Learn new skills, network, and grow together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ground text-ink">
        <AuthModalProvider />
        {children}
      </body>
    </html>
  );
}
