import Link from 'next/link'
import React from 'react'

const PracticePageBanner = () => {
    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white" id="el-bcydagv5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between" id="el-f6pp7hn2">
                <div className="mb-6 md:mb-0 md:mr-8" id="el-y9s0lsk8">
                    <h3 className="text-xl font-bold mb-2" id="el-g2kghqae">Ready to boost your learning?</h3>
                    <p className="text-primary-100 text-sm" id="el-58q0l8ml">Our AI-powered practice sessions are personalized for your needs.</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3" id="el-rfiedzt3">
                    <Link href={'/dashboard'} className="px-4 py-2 bg-white text-primary-600 font-medium rounded-md hover:bg-blue-50 transition-colors text-sm" id="el-56uqvr56">
                        Start AI-Powered Practice
                    </Link>
                    <Link href={'/mastery'} className="px-4 py-2 bg-primary-500 bg-opacity-30 text-white font-medium rounded-md hover:bg-opacity-40 transition-colors text-sm" id="el-s66k8d8r">
                        Check Mastery Breakdown
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PracticePageBanner