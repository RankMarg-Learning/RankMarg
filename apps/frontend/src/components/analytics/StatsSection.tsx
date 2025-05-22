import React from 'react'

const StatsSection = ({lowest,highest}:{lowest:number,highest:number}) => {
    return (
        <div className="p-4" id="el-3wnz42ao">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="el-ag0k5uzy">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center" id="el-sfljbzog">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400" id="el-o9t6ko39">{lowest}</div>
                    <div className="text-xs text-red-700 dark:text-red-300" id="el-l3liihd2">Lowest Score</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center" id="el-23a7du5v">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400" id="el-mq16bjdq">{highest}</div>
                    <div className="text-xs text-green-700 dark:text-green-300" id="el-wga6kian">Highest Score </div>
                </div>
            </div>
        </div>
    )
}

export default StatsSection