import MasterySubjectPage from '@/components/mastery/MasterySubjectPage';
import React from 'react'

export const metadata = {
  title: 'Subject Mastery | RankMarg',
  description:
    'Track your mastery progress in a specific subject with Rankmarg. Get detailed analytics, improvement areas, and smart recommendations to boost your performance. Elevate your preparation to the next level!',
  openGraph: {
    title: 'Subject Mastery for JEE & NEET – Rankmarg',
    description:
      'Track your mastery progress in a specific subject with Rankmarg. Get detailed analytics, improvement areas, and smart recommendations to boost your performance. Elevate your preparation to the next level!',
    url: 'https://rankmarg.in/mastery',
    type: 'website',
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