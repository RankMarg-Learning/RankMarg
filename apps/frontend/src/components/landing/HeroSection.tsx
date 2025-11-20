"use client"
import React from 'react';
import { Button } from '@repo/common-ui';
import { Sparkles, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { click_signup_cta } from '@/utils/analytics';

const FloatingBadge = ({ text, color }: { text: string; color: string }) => (
    <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-md ring-1 ring-black/5 ${color}`}>
        {text}
    </div>
);

const HeroSection = () => {
    const handleCTAClick = () => {
        click_signup_cta('Start Free Practice', 'hero_section');
    };

    return (
        <section className="relative overflow-hidden bg-primary-50">
            {/* subtle grid background (kept minimal for an academic look) */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#eef2f7_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-gray-800 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-gray-200">
                    <Sparkles className="w-4 h-4" />
                    Your Personal AI Coach
                </div>

                <h1 className="mt-6 font-Manrope text-[32px] leading-[1.15] sm:text-5xl md:text-6xl font-extrabold text-gray-900">
                    <span className="sm:hidden">AI Coach for Faster NEET/JEE Rank Growth.</span>
                    <span className="hidden sm:inline">
                        AI Coach for Faster
                        <br className="hidden sm:block" />
                        <span className="inline-block mt-2">NEET/JEE Rank Growth.</span>
                    </span>
                </h1>

                <p className="mt-4 mx-auto max-w-[680px] text-gray-600 text-[14px] sm:text-base md:text-lg">
                    RankMarg acts like a coach—diagnoses weak areas, builds daily practice sessions, gives hint‑first guidance,
                    tracks mistakes, and drives mastery with clear analytics—so your rank climbs faster.
                </p>

                <div className="mt-8 flex items-center justify-center">
                    <Link href="/sign-up">
                        <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-6 md:px-8 py-6 rounded-full" onClick={handleCTAClick}>
                            Start Free Practice
                        </Button>
                    </Link>
                </div>

                {/* floating badges - responsive */}
                <div className="block">
                    {/* Mobile: Show badges in a grid layout */}
                    <div className="md:hidden mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                        <FloatingBadge text="Smart Hints" color="bg-lime-200" />
                        <FloatingBadge text="Adaptive Practice" color="bg-orange-200" />
                        <FloatingBadge text="Strategies" color="bg-purple-200" />
                        <FloatingBadge text="Step Solutions" color="bg-blue-200" />
                        <FloatingBadge text="Mock Tests" color="bg-teal-200" />
                        <FloatingBadge text="Mastery System" color="bg-pink-200" />
                    </div>
                    
                    {/* Desktop: Show badges as floating elements */}
                    <div className="hidden md:block">
                        <div className="absolute left-8 top-40">
                            <FloatingBadge text="Smart Hints" color="bg-lime-200" />
                        </div>
                        <div className="absolute right-8 top-44">
                            <FloatingBadge text="Adaptive Practice" color="bg-orange-200" />
                        </div>
                        <div className="absolute left-12 top-60">
                            <FloatingBadge text="Strategies" color="bg-purple-200" />
                        </div>
                        <div className="absolute right-12 top-64">
                            <FloatingBadge text="Step Solutions" color="bg-blue-200" />
                        </div>
                        <div className="absolute left-16 top-80">
                            <FloatingBadge text="Mock Tests" color="bg-teal-200" />
                        </div>
                        <div className="absolute right-16 top-80">
                            <FloatingBadge text="Mastery System" color="bg-pink-200" />
                        </div>
                    </div>
                </div>


                {/* stacked visualization cards (education focused) */}
                <div className="mt-16 flex justify-center">
                    <div className="relative">
                        {/* background fanned cards to fill whitespace */}
                        <div className="absolute -right-36 -top-3 -rotate-6 w-80 h-20 bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-2xl p-4"/>
                        <div className="absolute -left-36 top-4 rotate-6 w-80 h-36 bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-2xl p-4"/>
                        <div className="absolute  -right-36 top-4 rotate-6 w-80  bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-2xl p-4" >
                            <div className="text-sm text-gray-500">Today's Analytics</div>
                            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">30</div>
                                    <div className="text-[11px] text-gray-500">Questions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">24</div>
                                    <div className="text-[11px] text-gray-500">Correct</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">1</div>
                                    <div className="text-[11px] text-gray-500">Tests</div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] text-gray-600">
                                    <span>Easy</span><span>•</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-3/4" />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600">
                                    <span>Medium</span><span>•</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-2/3" />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600">
                                    <span>Hard</span><span>•</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-1/3" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute md:-left-36 -left-20 top-10  rotate-[-12deg] w-80  bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-2xl p-4 border border-red-200" >
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <h4 className="font-semibold text-red-900 text-sm">Common Mistakes to Avoid</h4>
                            </div>
                            <div className="prose prose-sm max-w-none overflow-x-auto">
                                Mistake: "Wavelength stays the same"
                                <br />
                                Fix: Wavelength changes with medium because speed changes while frequency is constant
                            </div>
                        </div>

                            {/* Card A: How Hints Work */}
                            <div className="absolute md:-left-28 -left-20 -top-8 rotate-[8deg] bg-white w-80  rounded-lg border border-yellow-200 p-3 shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                                    <h3 className="font-semibold text-yellow-900 text-sm">Hint</h3>
                                </div>
                                <div className="prose prose-sm max-w-none overflow-x-auto">
                                    <p>Wavelength changes with medium because speed changes while frequency is constant</p>
                                </div>
                            </div>

                            {/* Card B: Today's Practice (Analytics) */}
                            <div className="relative z-10 ">
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100  flex items-center justify-center  md:min-w-[420px] min-w-[100px] rounded-2xl shadow-xl ring-1 ring-gray-200">
                                        <div>
                                            <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-medium text-slate-800">Personalized Session</h3>
                                                        <span className="px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md truncate">
                                                            16/20 Questions
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 mb-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs mb-1 text-slate-600">
                                                                <span>Progress</span>
                                                                <span className="font-medium">80%</span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                                                    style={{ width: `80%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-sm font-medium mb-2 text-slate-700">Key Topics:</div>
                                                        <div className="flex flex-wrap md:gap-1 gap-0.5">
                                                            {['Wave', 'Optics', 'Thermodynamics', 'Quantum Mechanics'].map((subtopic, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md truncate"
                                                                >
                                                                    {subtopic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>

                            {/* Foreground micro grid card */}
                            <div className="absolute left-1/2 -translate-x-1/2 md:-bottom-16 -bottom-8 z-20 rotate-1">
                                <div className="bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 p-3 w-[260px]">
                                    <div className="grid grid-cols-12 gap-1">
                                        {Array.from({ length: 36 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 rounded-sm ${i < 16 ? 'bg-green-500' : i < 24 ? 'bg-orange-500' : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-500 text-center">Progress grid</div>
                                </div>
                            </div>

                        {/* Card C: Mastery (Subject/Topic/Subtopic) */}
                        <div className="absolute -right-28 -top-10 rotate-[8deg] opacity-95 hidden">
                            <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 p-4 min-w-[240px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                                    <div className="text-sm font-semibold text-gray-900">Mastery</div>
                                </div>
                                <div className="space-y-2 text-[12px]">
                                    <div className="flex items-center justify-between"><span className="text-gray-600">Subject</span><span className="font-medium text-gray-900">78%</span></div>
                                    <div className="flex items-center justify-between"><span className="text-gray-600">Topic</span><span className="font-medium text-gray-900">64%</span></div>
                                    <div className="flex items-center justify-between"><span className="text-gray-600">Subtopic</span><span className="font-medium text-gray-900">51%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection