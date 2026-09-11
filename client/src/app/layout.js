import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthModalProvider from "@/components/AuthModalProvider";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://skhooler.com";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Skhooler — Learn, Connect and Grow",
    template: "%s · Skhooler",
  },
  description:
    "Skhooler is the all-in-one community platform for creators and educators. Host courses, run events, and build your community — all in one place.",
  keywords: ["online community", "courses", "e-learning", "creator platform", "community building"],
  authors: [{ name: "Skhooler" }],
  creator: "Skhooler",
  publisher: "Skhooler",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Skhooler",
    title: "Skhooler — Learn, Connect and Grow",
    description:
      "The all-in-one platform for community builders, educators, and creators.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Skhooler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skhooler — Learn, Connect and Grow",
    description: "The all-in-one platform for community builders, educators, and creators.",
    images: ["/og-default.png"],
    creator: "@skhooler",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b2334",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-screen flex flex-col bg-ground text-ink overflow-hidden`}
      >
        <SessionProvider>
          <AuthModalProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
