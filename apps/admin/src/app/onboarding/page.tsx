import OnboardingIndex from '@/components/onboarding/OnboardingHome'
import React from 'react'

export const metadata = {
  title: 'Get Started with RankMarg | Administrator Panel',
  description:
    'Join RankMarg to begin your personalized learning journey for JEE & NEET. Discover your strengths, fix weaknesses, and level up with smart practice and daily insights tailored just for you.',
  openGraph: {
    title: 'Get Started with RankMarg | Administrator Panel',
    description:
      'Join RankMarg to begin your personalized learning journey for JEE & NEET. Discover your strengths, fix weaknesses, and level up with smart practice and daily insights tailored just for you.',
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