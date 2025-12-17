import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Program | RankMarg',
  description: 'Join the RankMarg Partner Program and help students succeed while earning rewards. Track your referrals and see your impact.',
  keywords: ['partner program', 'referral program', 'affiliate', 'RankMarg', 'education'],
  openGraph: {
    title: 'Partner Program | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description: 'Join the RankMarg Partner Program and help students succeed while earning rewards.',
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
    title: 'Partner Program | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description: 'Join the RankMarg Partner Program and help students succeed while earning rewards.',
  },
};
