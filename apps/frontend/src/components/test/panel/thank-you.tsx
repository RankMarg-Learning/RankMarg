
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Clock } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Your test has been successfully submitted.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-semibold">Your results will be available soon!</p>
              <p className="mt-1">The analysis will be displayed once the test duration is complete.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          
            <p className="text-sm text-gray-500">Need help? <Link href="mailto:support@rankmarg.in" className="underline">Contact support</Link></p>
              <Link href={'/tests'}>
            <Button variant="outline">
              Return to Dashboard
              </Button>
              </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

