
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientSessionProvider from "@/context/ClientSessionProvider";
import GoogleAnalytics from "@/lib/GoogleAnalytics";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const GA_TRACKING_ID = "G-4R4ZKM8YXN";

export const metadata: Metadata = {
  title: "RankMarg | Learn, Solve, Achieve",
  description: "RankMarg is a cutting-edge ed-tech platform for JEE and NEET aspirants, designed to deliver a highly personalized and engaging learning experience. With a vast question bank, chapter-wise and topic-wise tests, and weekly mock tests every Sunday at 5 PM, RankMarg ensures thorough exam preparation. Its unique Elo-based ranking system provides dynamic assessments, while advanced performance analytics help students focus on areas needing improvement. Gamified features like the coin-based store and tier system motivate learners with rewards and progression milestones. Adaptive challenges tailored to individual strengths and weaknesses make RankMarg the ultimate companion for excelling in competitive exams.",
  openGraph: {
    title: 'RankMarg | Learn, Solve, Achieve',
    description:
      'RankMarg is a cutting-edge ed-tech platform for JEE and NEET aspirants, designed to deliver a highly personalized and engaging learning experience. With a vast question bank, chapter-wise and topic-wise tests, and weekly mock tests every Sunday at 5 PM, RankMarg ensures thorough exam preparation. Its unique Elo-based ranking system provides dynamic assessments, while advanced performance analytics help students focus on areas needing improvement. Gamified features like the coin-based store and tier system motivate learners with rewards and progression milestones. Adaptive challenges tailored to individual strengths and weaknesses make RankMarg the ultimate companion for excelling in competitive exams.',
    url: 'https://rankmarg.in',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>

      <ClientSessionProvider>

        <html lang="en">
          <head>
            <GoogleAnalytics trackingId={GA_TRACKING_ID} />
            <meta name="google-adsense-account" content="ca-pub-6631120605146752"></meta>
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased default-scroll`}
          >
            {children}
          </body>
        </html>
      </ClientSessionProvider>
    </>
  );
}
