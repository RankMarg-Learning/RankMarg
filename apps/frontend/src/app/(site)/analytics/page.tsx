
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import React from 'react'

export const metadata = {
    title: 'Performance Analytics | RankMarg',
    description:
      'Track and analyze your JEE & NEET performance with Rankmarg’s AI-powered analytics. Get deep insights into accuracy, speed, mastery, and weak areas to improve your ranking efficiently.',
    openGraph: {
      title: 'JEE & NEET Performance Analytics – Rankmarg',
      description:
        'Boost your exam preparation with AI-driven performance analytics. Identify weak areas, track mastery progress, and optimize your learning for better accuracy and speed!',
      url: 'https://rankmarg.in/analytics',
      type: 'website',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
  

const Analytics = () => {
    return (
       <AnalyticsDashboard/>
    )
}

export default Analytics