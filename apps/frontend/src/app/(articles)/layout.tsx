import { Metadata } from 'next';
import { ArticlesHeader } from '@/components/articles/ArticlesHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Articles | RankMarg - Your Personal AI Coach for JEE & NEET",
  description: "Explore expert articles, study tips, and insights to ace your JEE and NEET exams. Get the latest updates, strategies, and guidance from RankMarg.",
  openGraph: {
    title: "Articles | RankMarg - Your Personal AI Coach for JEE & NEET",
    description: "Explore expert articles, study tips, and insights to ace your JEE and NEET exams.",
    type: "website",
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png",
        width: 1200,
        height: 630,
        alt: "RankMarg Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles | RankMarg",
    description: "Explore expert articles, study tips, and insights to ace your JEE and NEET exams.",
  },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArticlesHeader />
      {children}
      <Footer />
    </>
  );
}
