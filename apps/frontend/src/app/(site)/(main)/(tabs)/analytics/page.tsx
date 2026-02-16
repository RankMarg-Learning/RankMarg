
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import React from 'react'

export const metadata = {
  title: 'Performance Analytics | RankMarg',
  description:
    'Track and analyze your JEE & NEET performance with Rankmarg’s AI-powered analytics. Get deep insights into accuracy, speed, mastery, and weak areas to improve your ranking efficiently.',
  openGraph: {
    title: 'Performance Analytics | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Track and analyze your JEE & NEET performance with Rankmarg’s AI-powered analytics. Get deep insights into accuracy, speed, mastery, and weak areas to improve your ranking efficiently.',
    url: 'https://rankmarg.in/analytics',
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
    title: 'Performance Analytics | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Track and analyze your JEE & NEET performance with Rankmarg’s AI-powered analytics. Get deep insights into accuracy, speed, mastery, and weak areas to improve your ranking efficiently.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};


const Analytics = () => {
  return (
    <AnalyticsDashboard />
  )
}

export default Analytics