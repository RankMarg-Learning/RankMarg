import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const BannerUpgrade = ({ title, description, reference }: { title: string, description: string, reference: string }) => {
  const router = useRouter()
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-900">{title}</h3>
            <p className="text-sm text-amber-700">{description}</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/subscription?plan=rank&ref=${reference}`)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Upgrade Now
        </Button>
      </div>
    </CardContent>
  </Card>
  )
}

export default BannerUpgrade