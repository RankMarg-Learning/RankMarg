import { DifficultyMetricsProps } from '@/types'
import { Info } from 'lucide-react'
import React from 'react'

const DifficultySection = ({diff}:{diff:DifficultyMetricsProps}) => {
    return (
        <div className="p-4" id="el-w1orlhac">
            <h4 className="font-medium text-sm mb-4" id="el-yraryi0u">Difficulty Breakdown</h4>
            <div id="el-8npgaot5">
                <div className="grid grid-cols-2 gap-2" id="el-87yorziw">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center" id="el-m3r322k6">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400" id="el-5p5lzsxm">{diff?.distribution?.easy}</div>
                        <div className="text-xs text-green-700 dark:text-green-300" id="el-ns7id7an">Easy</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center" id="el-5h0qbjv2">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400" id="el-28kqa2zj">{diff?.distribution?.medium}</div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-300" id="el-q1h91w6x">Medium</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center" id="el-m3r322k6">
                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400" id="el-5p5lzsxm">{diff?.distribution?.hard}</div>
                        <div className="text-xs text-orange-700 dark:text-orange-300" id="el-ns7id7an">Hard</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center" id="el-1o477zps">
                        <div className="text-xl font-bold text-red-600 dark:text-red-400" id="el-9o7gryzd">{diff?.distribution?.veryHard}</div>
                        <div className="text-xs text-red-700 dark:text-red-300" id="el-wo73et39">Very Hard</div>
                    </div>
                </div>
            </div>
            <div>
                <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3" id="el-2x1qg3m0">
                    <Info className="h-4 w-4 text-blue-500" />
                    {diff?.recommendation}
                    </div>

            </div>
        </div>
    )
}

export default DifficultySection