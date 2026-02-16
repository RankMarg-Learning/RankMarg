import MistakeTrackerDashboard from '@/components/mistake/MistakeTrackerDashboard'
import React from 'react'

export const metadata = {
  title: 'Mistake Tracker | RankMarg',
  description:
    'Track your mistakes and improve your performance with RankMarg’s Mistake Tracker. Get detailed analysis of your mistakes and improve your performance with RankMarg’s Mistake Tracker.',
  openGraph: {
    title: 'Mistake Tracker | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'RankMarg Mistake Tracker provides a comprehensive analysis of your mistakes and improve your performance with RankMarg’s Mistake Tracker.',
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/mistakes-tracker`,
    type: 'website',
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
    card: "summary_large_image",
    title: 'Mistake Tracker | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Track your mistakes and improve your performance with RankMarg’s Mistake Tracker. Get detailed analysis of your mistakes and improve your performance with RankMarg’s Mistake Tracker.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

const MistakeTrackerHome = () => {
  return (
    <MistakeTrackerDashboard />
  )
}

export default MistakeTrackerHome