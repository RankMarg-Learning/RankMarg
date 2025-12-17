import SaasPricing from '@/components/PricingPage'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Pricing | RankMarg",
  description:
    "Choose the best plan to boost your JEE/NEET preparation with RankMarg. Get AI-powered personalized practice, dynamic tests, mastery tracking, and progress insights—all at an affordable price.",
  keywords: [
    "RankMarg Pricing",
    "JEE Preparation Plans",
    "NEET Subscription",
    "Affordable JEE Coaching",
    "NEET Online Practice Price",
    "Rank Improvement Plans",
    "Adaptive Learning Pricing",
    "Mock Test Subscription",
    "Personalized Practice Plans",
  ],
  openGraph: {
    title: "Pricing | RankMarg",
    description:
      "Explore RankMarg’s subscription plans for JEE & NEET. Access adaptive practice, daily smart questions, test analytics, and mastery tracking at the best price.",
    url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/pricing`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/pricing-preview.png`,
        width: 1200,
        height: 630,
        alt: "RankMarg Pricing Plans – Personalized Practice for JEE & NEET",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankMarg Pricing | Personalized JEE & NEET Practice Plans",
    description:
      "Unlock your personalized JEE & NEET practice journey with RankMarg’s affordable plans. Get AI-driven insights, adaptive learning, and daily practice for exam success.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL),
};


const page = () => {
  return (
    <div>
        <SaasPricing/>
    </div>
  )
}

export default page