import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@repo/common-ui';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Download RankMarg Mobile App',
  description: 'Experience the power of personalized AI coaching on the go. Download the RankMarg Android App for JEE & NEET preparation.',
}

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-primary-50 flex flex-col pt-16">
      {/* Navigation Layer */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex-shrink-0">
              <Image src={'https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG'} alt="RankMarg" width={140} height={40} priority className="h-10 w-auto" />
            </Link>
            <div className="flex gap-4">
              <Link href="/sign-up">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-8 pb-16 overflow-hidden relative">
        {/* Background Decorative Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-[80px] mix-blend-multiply"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0 max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-bold mb-8 shadow-sm border border-primary-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </span>
                Now Available on Android
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.15]">
                Your AI Practice Coach, <br className="hidden lg:block" />
                <span className="text-primary-600">Now in Your Pocket.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Achieve your dream JEE & NEET ranks faster. Practice on the go, track your mastery, and fix mistakes with RankMarg's powerful mobile application.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start ">
                <a
                  href="https://play.google.com/store/apps/details?id=com.rankmarg.app&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform duration-200 hover:-translate-y-1 hover:brightness-110 drop-shadow-xl hover:drop-shadow-2xl inline-block"
                >
                  <Image
                    src="/download_app.png"
                    alt="Get it on Google Play"
                    width={200}
                    height={60}
                    className="h-[60px] w-auto object-contain"
                    priority
                  />
                </a>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Daily Challenges
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Seamless Sync
                </div>
              </div>
            </div>

            {/* Coded UI Mockup mimicking the uploaded image */}
            <div className="flex-1 w-full max-w-lg relative pb-4 lg:pb-0 flex items-center justify-center mt-12 lg:mt-0 min-h-[550px] lg:min-h-[600px] mx-auto">
              
              {/* Floating Effects */}
              <div className="absolute top-[10%] right-[0%] w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none z-0"></div>
              <div className="absolute bottom-[10%] left-[0%] w-56 h-56 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

              {/* Card 1: Back (Smart...) */}
              <div className="absolute top-[5%] lg:top-[2%] left-[5%] lg:left-[5%] w-[65%] sm:w-[260px] bg-[#fdfaf3] rounded-3xl shadow-sm border border-[#f5eedc] p-5 transform -rotate-3 scale-95 z-10 transition-transform duration-700 hover:-rotate-1 hover:scale-100 opacity-90">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm relative">
                    S
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <div className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Smart...
                </div>
                <div className="text-sm text-gray-500 mb-4 font-medium">Your person...</div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100/60 text-yellow-700 rounded-lg text-xs font-bold">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.5c-3.5 0-6.5-2.8-6.5-6.2 0-2.8 1.9-4.8 3.5-6.5l3-3.1 3 3.1c1.6 1.7 3.5 3.7 3.5 6.5 0 3.4-3 6.2-6.5 6.2z"/></svg>
                  1 day str...
                </div>
              </div>

              {/* Card 2: Middle (Study Topics) */}
              <div className="absolute top-[18%] lg:top-[12%] left-[12%] lg:left-[15%] w-[85%] sm:w-[320px] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-0 transform -rotate-1 z-20 transition-transform duration-700 hover:rotate-0 hover:-translate-y-2">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                    <span className="font-bold text-gray-900 text-[17px]">Study Topics</span>
                  </div>
                  <div className="font-bold text-gray-800 mb-3 ml-1 text-[15px]">Chemistry</div>
                  
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="p-4 rounded-[1.25rem] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdfaf3] flex items-center justify-center text-yellow-600">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <span className="font-bold text-gray-800 text-[14px]">Thermodynamics</span>
                      </div>
                      <div className="flex gap-2 flex-wrap pl-11">
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] sm:text-[11px] font-semibold border border-gray-100 shadow-sm leading-none">Thermotorics</span>
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] sm:text-[11px] font-semibold border border-gray-100 shadow-sm leading-none">Kinematics</span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 rounded-[1.25rem] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <span className="font-bold text-gray-800 text-[14px] truncate">Some Basic Concepts In Chemistry</span>
                      </div>
                      <div className="flex gap-2 flex-wrap pl-11">
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] sm:text-[11px] font-semibold border border-gray-100 shadow-sm leading-none">Thermody Concepts In Chemistry</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-center py-3 bg-gray-50/20 rounded-b-[2rem]">
                  <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                </div>
              </div>

              {/* Card 3: Front (Physics Practice) */}
              <div className="absolute top-[50%] lg:top-[40%] w-[95%] sm:w-[420px] rounded-[1.5rem] shadow-[0_25px_60px_-15px_rgba(124,58,237,0.25)] border border-purple-100/60 p-5 sm:p-6 z-30 transition-transform duration-700 hover:-translate-y-2 hover:shadow-[0_35px_70px_-15px_rgba(124,58,237,0.3)] relative overflow-hidden bg-[#fbfaff]">
                
                {/* Subtle gradient overlay to match image's purple tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ff] to-[#f2ebff] pointer-events-none z-0"></div>

                <div className="relative z-10">
                  {/* Title & Badge Row */}
                  <div className="flex items-start justify-between mb-5 sm:mb-6">
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[50%] border-2 border-white flex items-center justify-center bg-white shadow-sm text-gray-700 flex-shrink-0">
                         <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-[22px] font-bold text-gray-900 leading-tight">Physics Practice</h2>
                        <p className="text-gray-500 text-[13px] sm:text-[15px] font-medium mt-0.5">Adaptive Question Session</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-white rounded-full text-[12px] font-bold text-gray-600 border border-gray-100 shadow-sm flex-shrink-0 leading-none items-center flex h-8">
                      5 Questions
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5 sm:mb-6">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[14px] font-medium text-gray-800">Progress</span>
                      <span className="text-[14px] font-bold text-gray-800">20%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200/80 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A374F9] w-[20%] rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  {/* 3 Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
                    <div className="bg-white rounded-[1rem] p-3 sm:p-3.5 shadow-sm outline outline-1 outline-gray-50">
                      <div className="text-[11px] sm:text-[12px] font-medium text-gray-500 mb-1.5">Time Required</div>
                      <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-gray-800">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        7m 30s
                      </div>
                    </div>
                    <div className="bg-white rounded-[1rem] p-3 sm:p-3.5 shadow-sm outline outline-1 outline-gray-50">
                      <div className="text-[11px] sm:text-[12px] font-medium text-gray-500 mb-1.5">Last Active</div>
                      <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-gray-800 truncate">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="truncate">2/22/2026</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-[1rem] p-3 sm:p-3.5 shadow-sm outline outline-1 outline-gray-50">
                      <div className="text-[11px] sm:text-[12px] font-medium text-gray-500 mb-1.5">Difficulty</div>
                      <div className="text-[13px] sm:text-[14px] font-bold text-gray-800">Medium</div>
                    </div>
                  </div>

                  {/* Key Topics List */}
                  <div>
                    <div className="text-[14px] font-bold text-gray-800 mb-3">Key Topics:</div>
                    <div className="flex flex-col gap-2.5 relative">
                      <div className="self-start px-3 py-1.5 bg-white shadow-sm rounded-lg text-[12px] sm:text-[13px] font-medium text-gray-700 outline outline-1 outline-gray-50 max-w-[100%] truncate">
                        Physical Quantities and Units
                      </div>
                      <div className="self-start px-3 py-1.5 bg-white shadow-sm rounded-lg text-[12px] sm:text-[13px] font-medium text-gray-700 outline outline-1 outline-gray-50 max-w-[100%] truncate">
                        Rigid Body and Rotational Kinematics
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
