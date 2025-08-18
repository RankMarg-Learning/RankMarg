import { Metadata } from 'next';
import React from 'react';
import MyCurriculum from '@/components/MyCurriculum';

export const metadata: Metadata = {
  title: 'My Curriculum | RankMarg',
  description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
  keywords: 'curriculum, learning path, study plan, topics, progress tracking, NEET, JEE',
  openGraph: {
    title: 'My Curriculum | RankMarg',
    description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
    type: 'website',
    url: 'https://rankmarg.in/my-curriculum',
    siteName: 'RankMarg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Curriculum | RankMarg',
    description: 'Manage your learning curriculum, track current topics, and monitor your progress across subjects.',
    creator: '@rankmarg',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://rankmarg.in/my-curriculum',
  },
};

export default function MyCurriculumPage() {
  return <MyCurriculum />;
}


