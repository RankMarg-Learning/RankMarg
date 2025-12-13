
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
  title: "RankMarg | Administrator Panel",
  description:
    "Administrator panel for the RankMarg platform.",
  keywords: [
    "RankMarg",
    "Administrator Panel",
    "RankMarg Administrator",
  ],
  openGraph: {
    title: "RankMarg | Administrator Panel",
    description:
      "Boost your JEE/NEET rank with AI-powered practice, dynamic tests, and mastery tracking. Experience India's most personalized exam preparation platform.",
    url: `${process.env.NEXT_PUBLIC_ADMIN_URL}`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/Logo.svg`, 
        width: 1200,
        height: 630,
        alt: "RankMarg – Administrator Panel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankMarg | Administrator Panel",
    description:
      "Administrator panel for the RankMarg platform.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <head>
        <meta name="robots" content="noindex, nofollow" />
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
