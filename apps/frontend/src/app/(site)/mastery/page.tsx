import MasteryDashboard from '@/components/mastery/MasteryDashboard';
import React from 'react'


export const metadata = {
    title: 'AI Mastery | RankMarg',
    description:
      'Achieve AI-powered mastery in JEE & NEET with Rankmarg. Get daily personalized question sets, adaptive learning, real-time analytics, and mastery tracking to boost accuracy and speed. Elevate your preparation to the next level!',
    openGraph: {
      title: 'AI Mastery for JEE & NEET – Rankmarg',
      description:
        'Master JEE & NEET with AI-driven practice. Personalized question sets, adaptive learning, and performance insights to help you rank higher!',
      url: 'https://rankmarg.in/ai-mastery',
      type: 'website',
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