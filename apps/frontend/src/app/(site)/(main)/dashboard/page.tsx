import DashboardPage from '@/components/dashboard/DashboardPage';
import React from 'react'

export const metadata = {
  title: 'Dashboard | RankMarg',
  description:
    'Achieve AI-powered mastery in JEE & NEET with Rankmarg. Get daily personalized question sets, adaptive learning, real-time analytics, and mastery tracking to boost accuracy and speed. Elevate your preparation to the next level!',
  openGraph: {
    title: 'Dashboard | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Track your JEE & NEET preparation progress with Rankmarg’s personalized dashboard. Monitor your daily practice, mastery levels, and performance trends to optimize your study routine and achieve better results.',
    url: 'https://rankmarg.in/ai-mastery',
    type: 'website',
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
    card: "summary_large_image",
    title: 'Dashboard | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Track your JEE & NEET preparation progress with Rankmarg’s personalized dashboard. Monitor your daily practice, mastery levels, and performance trends to optimize your study routine and achieve better results.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const Dashboard = () => {
  return (
    <DashboardPage />
  )
}

export default Dashboard