import { TimingMetricsProps } from '@/types'
import { Info } from 'lucide-react'
import React from 'react'

function formatSecondsToMinSec(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const TimeDistribution = ({ time }: { time: TimingMetricsProps }) => {
  return (
    <div className="p-4" id="el-3wnz42ao">
      <h4 className="font-medium text-sm mb-4" id="el-yraryi0u">Problem-Solving Time Distribution</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="el-ag0k5uzy">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center" id="el-23a7du5v">
          <div className="text-lg font-bold text-green-600 dark:text-green-400" id="el-mq16bjdq">{formatSecondsToMinSec(time?.byDifficulty?.easy)}</div>
          <div className="text-xs text-green-700 dark:text-green-300" id="el-wga6kian">Avg. time for easy problems</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center" id="el-sfljbzog">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400" id="el-o9t6ko39">{formatSecondsToMinSec(time?.byDifficulty?.medium)}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300" id="el-l3liihd2">Avg. time for medium problems</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center" id="el-cr92rz0h">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400" id="el-0075903m">{formatSecondsToMinSec(time?.byDifficulty?.hard)}</div>
          <div className="text-xs text-amber-700 dark:text-amber-300" id="el-xifjm7mf">Avg. time for hard problems</div>
        </div>
      </div>
      <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3" id="el-2x1qg3m0">
        <Info className="h-4 w-4 text-blue-500" />
        {time?.recommendation}</div>
    </div>
  )
}

export default TimeDistribution