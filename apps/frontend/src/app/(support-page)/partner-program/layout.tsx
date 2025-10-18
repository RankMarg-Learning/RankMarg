import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Program | RankMarg',
  description: 'Join the RankMarg Partner Program and help students succeed while earning rewards. Track your referrals and see your impact.',
  keywords: ['partner program', 'referral program', 'affiliate', 'RankMarg', 'education'],
  openGraph: {
    title: 'Partner Program | RankMarg',
    description: 'Join the RankMarg Partner Program and help students succeed while earning rewards.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner Program | RankMarg',
    description: 'Join the RankMarg Partner Program and help students succeed while earning rewards.',
  },
};

export default function PartnerProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

