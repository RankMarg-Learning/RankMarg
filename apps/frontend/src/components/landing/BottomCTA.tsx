import React from 'react'
import { Button } from '../ui/button'
import Link from "next/link"

const BottomCTA = () => {
    return (
        <div className="bg-primary-900 text-white py-12 px-4 sm:px-6 lg:px-8" id="el-vihl5b65">
            <div className="text-center max-w-4xl mx-auto" id="el-mpucvz3w">
                <h2
                    className="font-Manrope text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                    id="el-rhio978q"
                >
                    Ready to Transform Your Preparation?
                </h2>

                <p
                    className="font-Inter text-base md:text-lg lg:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed"
                    id="el-z1kr04up"
                >
                    Join thousands of students who trust Rankmarg for their NEET/JEE success journey.
                </p>

                <div className="mb-10">
                    <Link href="/sign-up">
                        <Button
                            className="bg-white text-primary-900 hover:bg-primary-100 font-semibold px-8 py-6 text-base rounded-xl shadow-md transition-all duration-300 hover:scale-105"
                            id="el-taz3sgbx"
                        >
                            Start Free Trial Now
                        </Button>
                    </Link>
                </div>

                {/* Optional Metrics */}
                <div className="hidden grid-cols-1 sm:grid-cols-3 gap-8 mt-10 max-w-3xl mx-auto">
                    <div className="text-center">
                        <div className="font-Manrope text-3xl md:text-4xl font-bold text-white">250K+</div>
                        <div className="font-Inter text-sm text-primary-100">Questions Solved Daily</div>
                    </div>
                    <div className="text-center">
                        <div className="font-Manrope text-3xl md:text-4xl font-bold text-white">18K+</div>
                        <div className="font-Inter text-sm text-primary-100">Students Scored 600+</div>
                    </div>
                    <div className="text-center">
                        <div className="font-Manrope text-3xl md:text-4xl font-bold text-white">4.9/5</div>
                        <div className="font-Inter text-sm text-primary-100">Average Rating</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BottomCTA
