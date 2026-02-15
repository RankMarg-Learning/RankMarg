import { Metadata } from 'next';
import React from 'react';
import MyCurriculum from '@/components/MyCurriculum';

export const metadata: Metadata = {
  title: 'My Curriculum | RankMarg',
  description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
  keywords: 'curriculum, learning path, study plan, topics, progress tracking, NEET, JEE',
  openGraph: {
    title: 'My Curriculum | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
    type: 'website',
    url: 'https://rankmarg.in/my-curriculum',
    siteName: 'RankMarg',
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png",
        width: 1200,
        height: 630,
        alt: "RankMarg – Your Personal AI Practice Coach for JEE & NEET ",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Curriculum | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function MyCurriculumPage() {
  return <MyCurriculum />;
}


