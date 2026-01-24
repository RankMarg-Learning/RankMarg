import MasteryDashboard from '@/components/mastery/MasteryDashboard';
import React from 'react'


export const metadata = {
    title: 'AI Mastery | RankMarg',
    description:
      'Achieve AI-powered mastery in JEE & NEET with Rankmarg. Get daily personalized question sets, adaptive learning, real-time analytics, and mastery tracking to boost accuracy and speed. Elevate your preparation to the next level!',
    openGraph: {
      title: 'AI Mastery | RankMarg - Your Personal AI Coach for JEE & NEET ',
      description:
        'Achieve AI-powered mastery in JEE & NEET with Rankmarg. Get daily personalized question sets, adaptive learning, real-time analytics, and mastery tracking to boost accuracy and speed. Elevate your preparation to the next level!',
      url: 'https://rankmarg.in/ai-mastery',
      type: 'website',
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
      title: 'AI Mastery | RankMarg - Your Personal AI Coach for JEE & NEET ',
      description:
        'Achieve AI-powered mastery in JEE & NEET with Rankmarg. Get daily personalized question sets, adaptive learning, real-time analytics, and mastery tracking to boost accuracy and speed. Elevate your preparation to the next level!',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
  

const MasteryHomePage = () => {
  return (
    <MasteryDashboard/>
  )
}

export default MasteryHomePage