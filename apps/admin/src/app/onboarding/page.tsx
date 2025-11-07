import OnboardingIndex from '@/components/onboarding/OnboardingHome'
import React from 'react'

export const metadata = {
  title: 'Get Started with RankMarg | Personalized JEE & NEET Practice',
  description:
    'Join RankMarg to begin your personalized learning journey for JEE & NEET. Discover your strengths, fix weaknesses, and level up with smart practice and daily insights tailored just for you.',
  openGraph: {
    title: 'Start Your Smart Practice Journey – RankMarg Onboarding',
    description:
      'Welcome to RankMarg! Get started with your AI-personalized JEE & NEET practice plan. Master concepts, improve accuracy, and track your daily progress from day one.',
    url: 'https://rankmarg.in/onboarding',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const page = () => {
  return (
    <OnboardingIndex/>
  )
}

export default page