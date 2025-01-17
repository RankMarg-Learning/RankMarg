'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"
import { Brain, Trophy, BarChart2, Gamepad, ClipboardList, BarChart3, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut, useSession } from 'next-auth/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TiltedScroll from "@/components/TiltedScroll"

const BlobShape = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1 }}
    className={className}
  >
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        fill="currentColor"
        d="M45.7,-77.8C58.9,-69.3,69.3,-55.5,76.8,-40.3C84.3,-25.1,89,-8.5,87.5,7.4C86,23.3,78.4,38.5,67.8,50.2C57.2,61.9,43.6,70.1,29,74.7C14.4,79.3,-1.3,80.3,-16.8,77.1C-32.3,73.9,-47.6,66.5,-60.2,55.3C-72.8,44.1,-82.7,29,-85.1,12.8C-87.5,-3.4,-82.3,-20.7,-73.7,-35.3C-65.1,-49.9,-53,-61.8,-39.4,-70C-25.8,-78.2,-10.7,-82.7,3.4,-88.1C17.5,-93.5,32.5,-86.3,45.7,-77.8Z"
        transform="translate(100 100)"
      />
    </svg>
  </motion.div>
)

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const rankingData = [
  {
    rank: "Rookie",
    subRanks: ["Rookie I", "Rookie II", "Rookie III"],
  },
  {
    rank: "Aspirant",
    subRanks: ["Aspirant I", "Aspirant II", "Aspirant III"],
  },
  {
    rank: "Contender",
    subRanks: ["Contender I", "Contender II", "Contender III"],
  },
  {
    rank: "Achiever",
    subRanks: ["Achiever I", "Achiever II", "Achiever III"],
  },
  {
    rank: "Luminary",
    subRanks: ["Luminary I", "Luminary II", "Luminary III"],
  },
  {
    rank: "Visionary",
    subRanks: ["Visionary I", "Visionary II", "Visionary III"],
  },
  {
    rank: "Champion",
    subRanks: ["Champion I", "Champion II"],
  }
]

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-yellow-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-yellow-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Image src={'https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG'} alt="Acme Inc" width={140} height={140} priority />
            </div>

            <div className="flex gap-4">
              {
                status === "loading" ? null : status === "unauthenticated" ? (
                  <div className="flex gap-1 md:gap-2">
                    <Link href={"/sign-in"}>
                      {" "}
                      <Button>Login</Button>
                    </Link>
                    <Link href={"/sign-up"}>
                      {" "}
                      <Button>Register</Button>
                    </Link>
                  </div>) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <p className='hover:underline cursor-pointer '> Welcome, {session.user.name}! </p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#f6f6f6]">
                      <Link href={`/u/${session?.user?.username}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )

              }

            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <BlobShape className=" hidden md:flex absolute top-1/2 right-0 w-64 h-64 text-yellow-300 translate-x-1/3" />

            <div className="space-y-8 relative">


              {/* Decorative Circle */}
              <div className="absolute -left-8 -top-8 w-[200px] h-[200px] bg-[#FFF176] rounded-full -z-10" />

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl lg:text-6xl font-bold text-[#8B4513]">
                Ace Your{" "}
                <span className="text-[#F7B614]">JEE &</span>
                <br />
                <span className="text-[#F7B614]">NEET</span> Preparation
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }} className="text-[#B8860B] text-xl">

                Comprehensive practice questions, mock tests, and detailed insights to boost your exam preparation
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
                <Link href={'/questionset'}>
                  <Button className="bg-[#F7B614] hover:bg-[#E5A912] text-white md:text-lg text-base px-8 py-6">
                    Start Free Practice
                  </Button>
                </Link>
                <Link href={"/tests"}>
                  <Button variant="outline" className="text-[#8B4513] md:text-lg text-base border-[#8B4513] hover:bg-[#F7B614] hover:text-white hover:border-[#F7B614]  px-10 py-6">
                    View Mock Tests
                  </Button>
                </Link>
              </motion.div>

              <div className="flex gap-8 text-[#B8860B]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }} className="flex items-center gap-2">
                  <div className="text-[#F7B614]">✓</div>
                  <span>500+ Questions</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }} className="flex items-center gap-2">
                  <div className="text-[#F7B614]">✓</div>
                  <span>10+ Mock Tests</span>
                </motion.div>
              </div>
            </div>

            <BlobShape className="absolute bottom-0 left-1/2 w-80 h-80 text-yellow-100 -translate-x-1/2 translate-y-1/4" />
            <div className="space-y-4 relative">
              <BlobShape className="hidden md:flex absolute top-0 md:left-1/3 w-72 h-72 text-yellow-200 -translate-x-1/2 -translate-y-1/2" />
              {/* Decorative Circle */}
              <div className="absolute -right-3 -bottom-8 w-[150px] h-[150px] bg-[#FFF176] rounded-full -z-10" />

              {/* <TiltedScroll /> */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }} className="md:p-6 p-3 grid md:gap-3 gap-2 backdrop-blur-lg bg-white/40  rounded-xl shadow-lg">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="md:p-5 p-3 bg-white/50 border-[#F7B614]/20 hover:border-[#F7B614] transition-colors rounded-lg shadow-md ">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-[#F7B614] rounded-lg">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-[#8B4513]">Practice Mock Test</h3>
                      <p className="text-[#B8860B] text-sm md:text-base">Topic-wise sorted Mock Test</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }} className="md:p-5 p-3 bg-white/50 border-[#F7B614]/20 hover:border-[#F7B614] transition-colors rounded-lg shadow-md">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-[#F7B614] rounded-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-[#8B4513]">Performance Analytics</h3>
                      <p className="text-[#B8860B] text-sm md:text-base">Detailed progress tracking</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold mb-12 text-center text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Key Features
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  title: "Comprehensive Question Bank",
                  description: "Access a wide range of expertly curated questions tailored to JEE. With AI-powered our question bank adapts to your progress.",
                  icon: Brain,
                },
                {
                  title: "Compete with Peers in Real-Time",
                  description: "Join live challenges and compete with friends or fellow students. The first to solve the problem wins, creating excitement and healthy competition.",
                  icon: Trophy,
                },
                {
                  title: "Track Your Progress",
                  description: "Detailed performance analytics give you insights into your strengths and areas for improvement. Stay on track to reach your full potential.",
                  icon: BarChart2,
                },
                {
                  title: "Learn While You Play",
                  description: "Turn your study sessions into a fun and rewarding experience with points, badges, and leaderboards. Stay motivated to learn!",
                  icon: Gamepad,
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-yellow-50 border-yellow-100 h-full">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-yellow-500 mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>




        {/* Testimonials Section */}
        <section className="hidden bg-yellow-100 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-800">What Our Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Priya S.", quote: "EduTech transformed my NEET preparation. The adaptive learning is a game-changer!", avatar: "/placeholder.svg?height=100&width=100" },
                { name: "Rahul M.", quote: "Thanks to EduTech, I cracked JEE with flying colors. The practice tests were spot on!", avatar: "/placeholder.svg?height=100&width=100" },
                { name: "Ananya K.", quote: "The personalized study plans helped me focus on my weak areas. Highly recommended!", avatar: "/placeholder.svg?height=100&width=100" },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.avatar}
                      width={50}
                      height={50}
                      alt={testimonial.name}
                      className="rounded-full mr-4"
                    />
                    <h3 className="font-semibold text-yellow-800">{testimonial.name}</h3>
                  </div>
                  <p className="text-yellow-600 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-yellow-800 py-16 relative">
      {/* Decorative circles */}
      <div className="absolute left-0 top-0 w-[200px] h-[200px] bg-[#FFF176] rounded-full opacity-50 -z-10" />
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] bg-[#FFF176] rounded-full opacity-50 -z-10" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Student Performance Analytics
          </h2>
          <p className="text-gray-300 text-lg">
            Track your progress and understand your strengths and weaknesses
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Overview Card */}
          <Card className="bg-white border-[#F7B614]/20 p-6">
            <h3 className="text-xl font-semibold text-[#8B4513] mb-6">
              Performance Overview
            </h3>
            <div className="space-y-6">
              {/* Physics Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Physics</span>
                  <span className="text-gray-800">85%</span>
                </div>
                <div className="h-2 bg-[#FFF9EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B4513] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Chemistry Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Chemistry</span>
                  <span className="text-gray-800">78%</span>
                </div>
                <div className="h-2 bg-[#FFF9EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B4513] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Mathematics Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Mathematics</span>
                  <span className="text-gray-800">92%</span>
                </div>
                <div className="h-2 bg-[#FFF9EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B4513] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Biology</span>
                  <span className="text-gray-800">96.67%</span>
                </div>
                <div className="h-2 bg-[#FFF9EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B4513] rounded-full" style={{ width: '96%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Metrics Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Tests Completed */}
            <Card className="bg-white border-[#F7B614]/20 p-6 hover:border-[#F7B614] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-[#F7B614]/10 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-[#F7B614]" />
                </div>
                <h3 className="text-[#8B4513] font-medium">Tests Score</h3>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#8B4513]">248/300</div>
                <div className="text-sm text-[#B8860B]">83.67% Score</div>
              </div>
            </Card>

            {/* Average Score */}
            <Card className="bg-white border-[#F7B614]/20 p-6 hover:border-[#F7B614] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-[#F7B614]/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#F7B614]" />
                </div>
                <h3 className="text-[#8B4513] font-medium">Time Taken</h3>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#8B4513]">2h 45m</div>
                <div className="text-sm text-[#F7B614]">51 mins saved</div>
              </div>
            </Card>

            {/* Average Time */}
            <Card className="bg-white border-[#F7B614]/20 p-6 hover:border-[#F7B614] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-[#F7B614]/10 rounded-lg">
                  <Clock className="w-5 h-5 text-[#F7B614]" />
                </div>
                <h3 className="text-[#8B4513] font-medium">Avg. Time per Question</h3>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#8B4513]">1.8m</div>
                <div className="text-sm text-[#B8860B]">Target: 1.5m</div>
              </div>
            </Card>

            {/* Accuracy Rate */}
            <Card className="bg-white border-[#F7B614]/20 p-6 hover:border-[#F7B614] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-[#F7B614]/10 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-[#F7B614]" />
                </div>
                <h3 className="text-[#8B4513] font-medium">Accuracy Rate</h3>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#8B4513]">76%</div>
                <div className="text-sm text-[#F7B614]">+2.4% from last week</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

        {/* Rewards & Tiers Section */}
        <section id="ranking" className="min-h-screen bg-yellow-50 text-yellow-900 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-12 text-yellow-600">
              <Trophy className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Ranking Progression</h2>
            </div>

            <div className="relative pl-8">
              {/* Vertical Line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-yellow-300" />

              {/* Ranking Items */}
              {rankingData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative mb-12 last:mb-0"
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[0.5625rem] w-4 h-4 rounded-full bg-yellow-400" />

                  {/* Content */}
                  <div className="ml-8">
                    <h3 className="text-xl font-semibold mb-1 text-yellow-800">{item.rank}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {item.subRanks.map((subRank, subIndex) => (
                        <span key={subIndex} className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          {subRank}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>


        {/* Qoute Section */}
        <section className="relative w-full h-52 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-hidden flex justify-center items-center my-24 bg-yellow-900">
          <div className="absolute text-3xl sm:text-2xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-yellow-100 tracking-wide text-center px-4">
            COMPETE.LEARN.ACHIEVE
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-yellow-100 py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-800">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {[
                { question: "What is RankMarg?", answer: "RankMarg is a gamified learning platform for NEET and JEE aspirants, offering personalized content, real-time challenges, and performance insights to help you excel." },
                { question: "What kind of challenges does RankMarg offer?", answer: "Challenges are short (10–15 minutes), real-time quizzes where you compete with others. Questions are tailored to your chosen exam (NEET or JEE)." },
                { question: "What is the tier system?", answer: "The tier system ranks users into five levels, each with sub-tiers, based on Elo ratings and challenge performance." },
                { question: "How do I report bugs or suggest features?", answer: "Use the 'Email' section in your profile menu to share suggestions or report issues." },

              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-yellow-800 hover:text-yellow-600">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-yellow-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>



        {/* Footer */}
        <footer className="bg-yellow-800 text-yellow-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">RankMarg</h3>
                <p className="text-yellow-200">Empowering students to achieve their dreams in NEET and JEE.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="hover:text-yellow-300">Home</a></li>
                  <li><a href="#features" className="hover:text-yellow-300">Features</a></li>
                  <li><a href="#ranking" className="hover:text-yellow-300">Ranking</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="/terms" className="hover:text-yellow-300">Terms of Service</a></li>
                  <li><a href="/privacy-policy" className="hover:text-yellow-300">Privacy Policy</a></li>
                </ul>
              </div>

            </div>
            <div className="mt-8 pt-8 border-t border-yellow-700 text-center">
              <p>&copy; 2024 RankMarg. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}