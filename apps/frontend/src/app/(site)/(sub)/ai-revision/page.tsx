import RevisionDashboard from "@/components/revision/RevisionDashboard";

export const metadata = {
  title: 'AI Revision Schedule | RankMarg',
  description:
    'Master spaced repetition with Rankmarg\'s AI-powered revision schedule. Get personalized review reminders, track retention strength, and optimize your JEE & NEET preparation with intelligent revision planning. Never forget to review important topics again!',
  openGraph: {
    title: 'AI Revision Schedule | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description:
      'Master spaced repetition with Rankmarg\'s AI-powered revision schedule. Get personalized review reminders, track retention strength, and optimize your JEE & NEET preparation with intelligent revision planning. Never forget to review important topics again!',
    url: 'https://rankmarg.in/ai-revision',
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
    card: 'summary_large_image',
    title: 'AI Revision Schedule | RankMarg',
    description:
      'Master spaced repetition with AI-powered revision scheduling. Track retention and optimize your JEE & NEET preparation!',
  },
  keywords: [
    'AI revision schedule',
    'spaced repetition',
    'JEE revision',
    'NEET revision',
    'revision planning',
    'retention tracking',
    'smart revision',
    'exam preparation',
    'RankMarg',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

const AIRevisionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI Revision Schedule
        </h1>
        <p className="text-gray-600 text-sm">
          Never forget to review important topics. Our AI-powered spaced repetition system helps you retain knowledge longer.
        </p>
      </div>
      <RevisionDashboard />
    </div>
  );
};

export default AIRevisionPage;
