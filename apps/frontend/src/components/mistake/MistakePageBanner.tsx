import Link from 'next/link'
import React from 'react'

const MistakePageBanner = () => {
    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white" id="el-bcydagv5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between" id="el-f6pp7hn2">
                <div className="mb-6 md:mb-0 md:mr-8" id="el-y9s0lsk8">
                    <h3 className="text-xl font-extrabold mb-2" id="el-g2kghqae">
                        Unlock Your Full Potential by Analyzing Mistakes
                    </h3>
                    <p className="text-primary-100 text-sm max-w-md" id="el-58q0l8ml">
                    Spot your weak areas and fix them fast to climb the ranks!
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3" id="el-rfiedzt3">
                    <Link href={'/ai-practice/recentResults?s=mistake-tracker'} className="px-5 py-3 bg-white text-primary-700 font-semibold rounded-md hover:bg-blue-50 transition-colors text-sm" id="el-56uqvr56" aria-label="View your recent mistake analysis">
                        Review Recent Mistakes
                    </Link>
                    <Link href={'/tests?s=mistake-tracker'} className="px-5 py-3 bg-primary-500 bg-opacity-30 text-white font-semibold rounded-md hover:bg-opacity-40 transition-colors text-sm" id="el-s66k8d8r" aria-label="Check your mastery breakdown">
                        Explore Mock Tests 
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default MistakePageBanner
