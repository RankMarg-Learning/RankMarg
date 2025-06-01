"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Target, TrendingUp } from 'lucide-react';
import AnimatedDashboard from './AnimatedDashboard';
import Link from 'next/link';

const HeroSection = () => {
    
    return (

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-24">

            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8 animate-fade-in-up">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-primary-900 text-primary px-4 py-2 rounded-full text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            India’s Best Practice Platform
                        </div>

                        <h1 className="font-Manrope text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-700" id="el-211pmw0l">
                                Crack NEET/JEE with
                                <span className="text-primary mx-2" id="el-wg0u954k">AI-Personalized</span>
                                Daily Practice
                            </h1>

                        <p className="font-Inter text-sm md:text-base lg:text-lg text-gray-500 leading-relaxed max-w-lg">
                            Personalized practice sessions, intelligent mistake analysis, and
                            adaptive learning that boosts your rank by identifying exactly what you need to study.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid sm:grid-cols-2 grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-primary/20 rounded-lg backdrop-blur-sm">
                            <Target className="w-4 h-4 text-brand-blue" />
                            <div>
                                <div className="font-semibold text-sm text-gray-800">Smart Practice</div>
                                <div className="text-xs text-gray-600">AI-curated questions</div>
                            </div>
                        </div>


                        <div className="flex items-center gap-3 p-4 bg-primary/20 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-brand-purple" />
                            <div>
                                <div className="font-semibold text-sm text-gray-800">Mistake Fixer</div>
                                <div className="text-xs text-gray-600">Learn from errors</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={'/questionset'} >
                                <Button 
                                size='lg'
                                className="w-full  border-2 border-primary  px-10  py-6 rounded-xl transition-all duration-300 ">
                                    Start Free Trial
                                </Button>
                            </Link>

                        <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-primary text-primary hover:bg-primary hover:text-gray-800 px-10  py-6 rounded-xl transition-all duration-300"
                        >
                            <Play className={`w-5 h-5 mr-2 transition-transform duration-300 scale-110`} />
                            Watch Demo
                            
                        </Button>
                    </div>

                    {/* Social Proof */}
                    <div className=" items-center gap-6 text-sm text-gray-600 hidden">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full border-2 border-white"></div>
                                ))}
                            </div>
                            <span>50,000+ students</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span>Average +247 rank boost</span>
                        </div>
                    </div>
                </div>

                {/* Right Content - Animated Dashboard */}
                <div className="relative">
                    <AnimatedDashboard />
                </div>
            </div>
        </div>
    )
}

export default HeroSection


{/* <div className="relative max-w-7xl mx-auto  sm:px-6 lg:px-8 pt-8 pb-24">
            <div className="px-4 sm:px-6 lg:px-8 relative z-10" id="el-g9k7td0l">
                <div className="grid lg:grid-cols-2 gap-12 items-center" id="el-p2ljl1vt">
                    <div className="space-y-8" id="el-6uonrwgd">
                        <div className="space-y-6" id="el-g1sqrt6t">
                            <h1 className="font-Manrope text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-700" id="el-211pmw0l">
                                Crack NEET/JEE with
                                <span className="text-primary mx-2" id="el-wg0u954k">AI-Personalized</span>
                                Daily Practice
                            </h1>

                            <p className="font-Inter text-sm md:text-base lg:text-lg text-gray-500 leading-relaxed max-w-lg" id="el-zps5vpv5">
                                India's only platform that adapts to your strengths, weaknesses, and daily performance.
                            </p>
                        </div>

                        <div
                            className="flex flex-col md:flex-row gap-4 justify-center md:justify-start items-center md:items-start"
                        >
                            <Link href={'/questionset'}>
                                <Button className="w-full md:w-auto bg-primary-500 hover:bg-primary-400 text-white md:text-lg text-xl px-10 md:px-6 py-6 ">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link href={"/tests"}>
                                <Button
                                    variant="outline"
                                    className="w-full md:w-auto text-primary-800  border-primary-800 hover:bg-primary-500 hover:text-white hover:border-primary-500 md:text-lg text-xl px-12 md:px-6 py-6"
                                >
                                    Watch Demo
                                </Button>
                            </Link>
                        </div>


                        <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gray-700">
                            <div className="text-center">
                                <div className="font-Manrope text-xl md:text-2xl font-bold text-primary-700">10K+</div>
                                <div className="font-Inter text-sm text-gray-500">Questions Available</div>
                            </div>
                            <div className="text-center">
                                <div className="font-Manrope text-xl md:text-2xl font-bold text-primary-700">92%</div>
                                <div className="font-Inter text-sm text-gray-500">Accuracy Improved</div>
                            </div>
                            <div className="text-center">
                                <div className="font-Manrope text-xl md:text-2xl font-bold text-primary-700">4.9/5</div>
                                <div className="font-Inter text-sm text-gray-500">User Rating</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative" id="el-0fij0nkx">
                        <div className="grid grid-cols-2 gap-4" id="el-dripoesi">
                            <div className="col-span-2 relative" id="el-4hd25zlm">
                                <Image src="/hero_pic1.jpg" alt="Student learning with AI-powered platform" width={1080} height={720} className="w-full h-80 object-cover rounded-2xl shadow-md active-edit-image" loading="eager" id="el-edcpnciq" />
                                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-lg text-neutral-900 p-4 rounded-xl border border-gray-300/40 shadow-xl" id="el-223flm9c">
                                    <div className="font-Manrope text-sm font-semibold text-primary" id="el-f8ymmxox">Today's Progress</div>
                                    <div className="font-Inter text-xs text-gray-800 mt-1" id="el-h00nmhtk">Physics: 85% • Chemistry: 92%</div>
                                    <div className="w-full bg-gray-200/40 rounded-full h-2 mt-2" id="el-u3cxq7ub">
                                        <div className="bg-primary h-2 rounded-full w-3/4" id="el-m7xkq2ke"></div>
                                    </div>
                                </div>
                            </div>

                            <div id="el-0916gm03">
                                <Image src="/hero_pic2.jpg" width={900} height={800} alt="Student studying with personalized content" className="w-full h-40 object-cover rounded-xl shadow-md " loading="eager" id="el-dbn2utk2" />
                            </div>

                            <div className="bg-yellow-200/40 backdrop-blur-2xl p-4 rounded-xl shadow-sm border border-primary-400" id="el-a6hs4ruy">
                                <div className="font-Manrope text-base font-bold text-primary-800" id="el-4dz3wtcc">Rank Boost</div>
                                <div className="font-Inter text-sm text-primary-700 mt-1" id="el-tivv4hdm">Average 15% improvement in 60 days</div>
                                <div className="flex items-center mt-2" id="el-9bt86biv">
                                    <TrendingUp className="text-primary-700 w-4 h-4" id="el-3q4j0x9k" />
                                    <div className="font-Manrope text-sm text-primary-700 ml-2" id="el-nq60d0ju">Trending Up</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> */}