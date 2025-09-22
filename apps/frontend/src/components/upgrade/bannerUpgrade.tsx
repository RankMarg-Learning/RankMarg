import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BannerUpgrade = ({ title, description, reference }: { title: string, description: string, reference: string }) => {
  const router = useRouter()
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-amber-900 text-sm sm:text-base truncate">{title}</h3>
              <p className="text-xs sm:text-sm text-amber-700 leading-snug">{description}</p>
            </div>
          </div>
          <div className="flex sm:justify-end">
            <Button
              onClick={() => router.push(`/subscription?plan=rank&ref=${reference}`)}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BannerUpgrade