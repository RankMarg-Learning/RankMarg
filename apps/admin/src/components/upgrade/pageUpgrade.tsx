import React from 'react'
import { Card, CardContent } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import { Crown,  CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  message?: string
  onUpgrade?: () => void
  reference?: string
}

const PageUpgrade = ({ message = 'Upgrade required to continue', onUpgrade, reference }: Props) => {
  const router = useRouter()
  const handleUpgrade = () => {
    if (onUpgrade) return onUpgrade()
    router.push(`/subscription?plan=rank&ref=${reference}`)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-5 sm:mb-6 text-center px-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1">
            <Crown className="h-4 w-4 text-primary-700" />
            <span className="text-[11px] sm:text-xs font-medium text-primary-800">Upgrade required</span>
          </div>
          <h1 className="mt-3 text-lg sm:text-2xl font-semibold text-gray-900 leading-snug">{message}</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">Unlock the Standard plan to continue without limits</p>
        </div>

        <div className="mx-auto max-w-2xl gap-4 ">
          {/* Left: Features */}
          <Card className="border-primary-200 shadow-none">
            <CardContent className="p-4 sm:p-6 bg-primary-50/50">
              <h3 className="text-sm sm:text-base font-semibold text-primary-900">What you unlock</h3>
              <ul className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  'Topic & Subtopic Mastery',
                  'Personalize Practice Sessions',
                  "Unlimited Tests",
                  'Smart Recommendations',
                  'Priority Updates & Support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm sm:text-[15px] text-primary-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 sm:mt-6 border-t pt-4">
              <h3 className="text-sm sm:text-base font-semibold text-primary-900">Ready to continue?</h3>
              <p className="text-xs sm:text-sm text-primary-800 mt-1">Upgrade once. Enjoy uninterrupted learning.</p>

              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <Button onClick={handleUpgrade} className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                  Upgrade Now
                </Button>
               
              </div>
              </div>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  )
}

export default PageUpgrade