import { Sidebar } from '@/components/admin/sidebar'


export const metadata = {
  title: 'Exam Platform Admin | RankMarg',
  description: 'Admin panel for the online exam platform',
  openGraph: {
    title: 'RankMarg | Learn, Compete, Achieve',
    description:
      'Compete with peers, sharpen your skills, and achieve top ranks with RankMarg’s personalized platform for NEET and JEE.',
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
        <div className="flex h-screen ">
          <Sidebar />
          <main className="flex-1 overflow-x-auto p-8">
            {children}
          </main>
        </div>
  )
}

