import PracticeDashboard from "@/components/ai-practice/PracticeDashboard";

export const metadata = {
  title: 'AI Practice | RankMarg',
  description:
    'Boost your JEE & NEET preparation with Rankmarg’s AI-powered practice system. Get daily personalized question sets, real-time performance tracking, and adaptive learning to improve your accuracy, speed, and mastery. Start your journey to a top rank today!',
  openGraph: {
    title: 'AI-Powered JEE & NEET Practice – Rankmarg',
    description:
      'Boost your JEE & NEET preparation with AI-driven personalized practice. Get adaptive question sets, performance tracking, and mastery insights to improve your rank!',
    url: 'https://rankmarg.in/ai-practice',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const AIPractice = () => {
  return (
    <PracticeDashboard/>
  )
}

export default AIPractice