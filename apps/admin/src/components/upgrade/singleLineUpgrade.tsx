import { Crown } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'

const SingleLineUpgrade = ({ title, reference }: { title: string, reference: string }) => {
  const router = useRouter()
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900">{title}</span>
      </div>
      <button className="text-xs font-medium text-amber-700 hover:text-amber-800 underline" onClick={() => router.push(`/subscription?plan=rank&ref=${reference}`)}>
        Upgrade now
      </button>
    </div>
  )
}

export default SingleLineUpgrade