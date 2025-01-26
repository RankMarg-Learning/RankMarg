import TestDashboard from "@/components/test/TestDashboard";

export const metadata = {
  title: 'Mock Tests | RankMarg',
  description:
    'Take your preparation to the next level with RankMarg’s Mock Tests. Designed for JEE and NEET aspirants, these tests offer a realistic exam experience with detailed performance analysis. Join chapter-wise, topic-wise, or full-length mock tests every Sunday at 5 PM to track your progress and boost your confidence.',
  openGraph: {
    title: 'RankMarg Mock Tests | Test Your Knowledge',
    description:
      'RankMarg Mock Tests provide a comprehensive exam simulation experience for JEE and NEET aspirants. Practice topic-wise, chapter-wise, and full-length tests aligned with the latest syllabus. Get detailed analysis, including time tracking, difficulty breakdown, and actionable insights to improve your performance.',
    url: 'https://rankmarg.in/mock-tests',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};



export default function Test() {
    
  return (
        <TestDashboard />
  )
}

