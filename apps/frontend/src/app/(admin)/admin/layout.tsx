import AdminSidebar from "@/components/admin/AdminSidebar"
import { Toaster } from "@/components/ui/toaster"
// import QueryProvider from "@/context/QueryContext"


export const metadata = {
  title: 'Administrator Panel | RankMarg',
  description: 'administrator panel for the online exam platform',
  openGraph: {
    title: 'RankMarg | Learn, Compete, Achieve',
    description:
      'RankMarg is a cutting-edge ed-tech platform for JEE and NEET aspirants, designed to deliver a highly personalized and engaging learning experience. With a vast question bank, chapter-wise and topic-wise tests, and weekly mock tests every Sunday at 5 PM, RankMarg ensures thorough exam preparation. Its unique Elo-based ranking system provides dynamic assessments, while advanced performance analytics help students focus on areas needing improvement. Gamified features like the coin-based store and tier system motivate learners with rewards and progression milestones. Adaptive challenges tailored to individual strengths and weaknesses make RankMarg the ultimate companion for excelling in competitive exams.',
    url: 'https://rankmarg.in',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <QueryProvider>
      <div className="flex h-screen ">
        <AdminSidebar />
        <main className="flex-1 overflow-x-auto p-2 md:p-8">
          {children}
          <Toaster />
        </main>
      </div>
    // </QueryProvider>
  )
}

