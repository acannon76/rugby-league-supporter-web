import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rugby-league-supporter-web.vercel.app"),

  title: {
    default: "Rugby League Supporter Guide",
    template: "%s | Rugby League Supporter Guide",
  },

  description:
    "Independent Rugby League supporter guide with Super League fixtures, results, league table, team guides, stadium information, parking, travel notes and matchday details.",

  keywords: [
    "rugby league",
    "super league",
    "rugby league fixtures",
    "super league results",
    "super league table",
    "rugby league teams",
    "rugby league stadiums",
    "away fans guide",
    "matchday guide",
    "rugby league supporter guide",
  ],

  authors: [{ name: "Rugby League Supporter Guide" }],
  creator: "Rugby League Supporter Guide",
  publisher: "Rugby League Supporter Guide",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Rugby League Supporter Guide",
    description:
      "Fixtures, results, league table, team guides and matchday information for Rugby League supporters.",
    url: "/",
    siteName: "Rugby League Supporter Guide",
    type: "website",
    locale: "en_GB",
  },

  twitter: {
    card: "summary",
    title: "Rugby League Supporter Guide",
    description:
      "Fixtures, results, league table, team guides and matchday information for Rugby League supporters.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}