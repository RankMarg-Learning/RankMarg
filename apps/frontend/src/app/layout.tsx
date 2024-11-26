
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientSessionProvider from "@/context/ClientSessionProvider";
import Head from "next/head";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "RankMarg | Learn, Compete, Achieve",
  description: "RankMarg is your ultimate companion for personalized learning, competitive challenges, and adaptive content tailored for NEET and JEE aspirants.",
  openGraph: {
    title: 'RankMarg | Learn, Compete, Achieve',
    description:
      'Compete with peers, sharpen your skills, and achieve top ranks with RankMarg’s personalized platform for NEET and JEE.',
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
    <Head>
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-4R4ZKM8YXN"></Script>
    <Script id="google-analytics">
    {`window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-4R4ZKM8YXN');
`}
    </Script>
    </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
      </body>
    </html>
      </ClientSessionProvider>
      </>
  );
}
