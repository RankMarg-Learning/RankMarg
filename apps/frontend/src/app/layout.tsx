
import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import QueryProvider from "@/context/QueryContext";
import Script from "next/script";
import ClientContextProvider from "@/context/ClientContextProvider";


const inter = Inter({ subsets: ["latin"] })

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;


export const metadata: Metadata = {
  title: "RankMarg | Your Personal AI Coach for JEE & NEET ",
  description: "RankMarg acts as your personal AI coach for JEE & NEET—analyzing mistakes, tracking mastery, planning revisions, and guiding daily practice to maximize rank improvement.",
  keywords: [
    "RankMarg",
    "RankMarg AI Coach",
    "JEE Personal Coach",
    "NEET AI Coach",
    "JEE Practice",
    "NEET Preparation",
    "Personalized Learning",
    "Mock Tests",
    "Topic-wise Practice",
    "Adaptive Learning",
    "Spaced Repetition",
    "Gamified Learning",
    "Adaptive Learning",
  ],
  openGraph: {
    title: "RankMarg | Your Personal AI Coach for JEE & NEET ",
    description:
    "An AI-driven personal coach for JEE & NEET aspirants—guiding what to practice, when to revise, and how to fix mistakes for consistent rank growth.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png", 
        width: 1200,
        height: 630,
        alt: "RankMarg – Your Personal AI Coach for JEE & NEET ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankMarg | Your Personal AI Coach for JEE & NEET ",
    description:
    "Stop guessing. Start improving. RankMarg is your AI coach that tracks mastery, diagnoses mistakes, and plans daily practice to boost JEE & NEET ranks.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL),
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
          <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload"/>
          <ClientContextProvider>
          <QueryProvider>
              {children}
          </QueryProvider>
          </ClientContextProvider>
        </body>
      </html>
  );
}
