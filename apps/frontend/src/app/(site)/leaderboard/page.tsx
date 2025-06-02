import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import React from 'react'

const LeaderboardPage = () => {
  return (
    <Card className="w-full p-6 text-center flex flex-col items-center gap-4 border-dashed border-2 border-gray-300">
      <Trophy className="w-12 h-12 text-yellow-500" />
      <h2 className="text-xl font-semibold">Leaderboard Coming Soon</h2>
      <p className="text-gray-600 max-w-md">
        We're building an exciting leaderboard to showcase top performers. Stay tuned for updates!
      </p>
      <Button variant="outline" className="mt-2">Notify Me</Button>
    </Card>
  )
}

export default LeaderboardPage