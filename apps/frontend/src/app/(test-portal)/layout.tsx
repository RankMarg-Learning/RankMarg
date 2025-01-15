import ClientSessionProvider from "@/context/ClientSessionProvider"
import QueryProvider from "@/context/QueryContext"
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
    <ClientSessionProvider>
      <QueryProvider> 
        <TestProvider>   
        {children}
        </TestProvider>
      </QueryProvider>
    </ClientSessionProvider>
  )
}

