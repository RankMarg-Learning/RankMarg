
import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import ClientSessionProvider from "@/context/ClientSessionProvider";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import QueryProvider from "@/context/QueryContext";


const inter = Inter({ subsets: ["latin"] })

const GA_TRACKING_ID = "G-4R4ZKM8YXN";

export const metadata: Metadata = {
  title: "RankMarg | Personalized Practice for JEE & NEET",
  description:
    "Boost your JEE/NEET rank with AI-powered practice, dynamic tests, and mastery tracking. Experience India's most personalized exam preparation platform.",
  keywords: [
    "RankMarg",
    "JEE Practice",
    "NEET Preparation",
    "Personalized Learning",
    "Mock Tests",
    "Topic-wise Practice",
    "Adaptive Learning",
    "Spaced Repetition",
    "Gamified Learning"
  ],
  openGraph: {
    title: "RankMarg | Personalized Practice for JEE & NEET",
    description:
      "Boost your JEE/NEET rank with AI-powered practice, dynamic tests, and mastery tracking. Experience India's most personalized exam preparation platform.",
    url: "https://www.rankmarg.in",
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: "https://www.rankmarg.in/Logo.svg", 
        width: 1200,
        height: 630,
        alt: "RankMarg – Personalized Practice Platform for JEE & NEET",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankMarg | Personalized Practice for JEE & NEET",
    description:
      "Crack JEE & NEET with adaptive practice, smart tests, mastery insights, and motivational challenges. Practice smarter, rank higher with RankMarg.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL("https://www.rankmarg.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <head>
          <GoogleAnalytics trackingId={GA_TRACKING_ID} />
        </head>
        <body
          className={`${inter.className}  antialiased default-scroll`}
        >
          <QueryProvider>
            <ClientSessionProvider>
              {children}
            </ClientSessionProvider>
          </QueryProvider>
        </body>
      </html>
  );
}
