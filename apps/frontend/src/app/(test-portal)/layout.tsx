import { TestProvider } from "@/context/TestContext"

export const metadata = {
  title: 'Student Test Portal',
  description: 'Take tests and view your results',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <TestProvider>   
        {children}
        </TestProvider>
  )
}

