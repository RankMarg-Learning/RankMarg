import MasterySubjectPage from '@/components/mastery/MasterySubjectPage';
import React from 'react'

export const metadata = {
  title: 'Subject Mastery | RankMarg',
  description:
    'Track your mastery progress in a specific subject with Rankmarg. Get detailed analytics, improvement areas, and smart recommendations to boost your performance. Elevate your preparation to the next level!',
  openGraph: {
    title: 'Subject Mastery | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description:
      'Track your mastery progress in a specific subject with Rankmarg. Get detailed analytics, improvement areas, and smart recommendations to boost your performance. Elevate your preparation to the next level!',
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png", 
        width: 1200,
        height: 630,
        alt: "RankMarg – Your Personal AI Coach for JEE & NEET ",
      },
    ],
    url: 'https://rankmarg.in/mastery',
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: 'Subject Mastery | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description:
      'Track your mastery progress in a specific subject with Rankmarg. Get detailed analytics, improvement areas, and smart recommendations to boost your performance. Elevate your preparation to the next level!',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const MasterySubject = ({ params }: { params: { subjectId: string } }) => {
    const { subjectId } = params
  return (
    <MasterySubjectPage subjectId={subjectId} />
  )
}

export default MasterySubject