import DashboardPage from '@/components/dashboard/DashboardPage'
import React from 'react'

export const metadata = {
    title: 'Dashboard | RankMarg',
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

const Dashboard = () => {
  return (
    <DashboardPage/>
  )
}

export default Dashboard