import PracticeDashboard from "@/components/ai-practice/PracticeDashboard";

export const metadata = {
  title: 'AI Practice | RankMarg',
  description:
    'Boost your JEE & NEET preparation with Rankmarg’s AI-powered practice system. Get daily personalized question sets, real-time performance tracking, and adaptive learning to improve your accuracy, speed, and mastery. Start your journey to a top rank today!',
  openGraph: {
    title: 'AI Practice | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Boost your JEE & NEET preparation with Rankmarg’s AI-powered practice system. Get daily personalized question sets, real-time performance tracking, and adaptive learning to improve your accuracy, speed, and mastery. Start your journey to a top rank today!',
    url: 'https://rankmarg.in/ai-practice',
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
    title: 'AI Practice | RankMarg - Your Personal AI Practice Coach for JEE & NEET ',
    description:
      'Boost your JEE & NEET preparation with Rankmarg’s AI-powered practice system. Get daily personalized question sets, real-time performance tracking, and adaptive learning to improve your accuracy, speed, and mastery. Start your journey to a top rank today!',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const AIPractice = () => {
  return (
    <PracticeDashboard />
  )
}

export default AIPractice