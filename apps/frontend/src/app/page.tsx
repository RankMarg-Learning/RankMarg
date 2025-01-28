'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"
import { Brain, Trophy, BarChart2, Gamepad, ClipboardList, BarChart3, Clock, TrendingUp, Mail, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut, useSession } from 'next-auth/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InstagramLogoIcon } from "@radix-ui/react-icons"

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
                className=" text-5xl lg:text-6xl font-bold text-[#8B4513]">
                Ace Your{" "}
                <span className="text-[#F7B614]">JEE &</span>
                <br />
                <span className="text-[#F7B614]">NEET</span> Preparation
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }} className="text-[#B8860B] md:text-xl text-base">

                Comprehensive practice questions, mock tests, and detailed insights to boost your exam preparation
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col md:flex-row gap-4 justify-center md:justify-start items-center md:items-start"
              >
                <Link href={'/questionset'}>
                  <Button className="w-full md:w-auto bg-[#F7B614] hover:bg-[#E5A912] text-white md:text-lg text-xl px-12 md:px-8 py-6 ">
                    Start Free Practice
                  </Button>
                </Link>
                <Link href={"/tests"}>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto text-[#8B4513]  border-[#8B4513] hover:bg-[#F7B614] hover:text-white hover:border-[#F7B614] md:text-lg text-xl px-14 md:px-8 py-6"
                  >
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
                  className="md:p-5 p-3 bg-white/50 border-[#F7B614]/20  hover:border-[#F7B614] transition-colors rounded-lg shadow-sm ">
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
                  transition={{ delay: 0.8 }} className="md:p-5 p-3 bg-white/50 border-[#F7B614]/20 hover:border-[#F7B614] transition-colors rounded-lg shadow-sm">
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
          <div className="container mx-auto ">
            <motion.h2
              className="text-3xl font-bold mb-12 text-center text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Key Features
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-20  "
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
                // {
                //   title: "Compete with Peers in Real-Time",
                //   description: "Join live challenges and compete with friends or fellow students. The first to solve the problem wins, creating excitement and healthy competition.",
                //   icon: Trophy,
                // },
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
            LEARN.SOLVE.ACHIEVE
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
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Details</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-yellow-500" />
                    <a href="mailto:support@rankmarg.in" className="hover:text-yellow-300">support@rankmarg.in</a>
                  </li>
                  <li className=" items-center gap-2 hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 50 50" className="text-yellow-500">
                      <path fill="currentColor" d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 29.079097 3.1186875 32.88588 4.984375 36.208984 L 2.0371094 46.730469 A 1.0001 1.0001 0 0 0 3.2402344 47.970703 L 14.210938 45.251953 C 17.434629 46.972929 21.092591 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 21.278025 46 17.792121 45.029635 14.761719 43.333984 A 1.0001 1.0001 0 0 0 14.033203 43.236328 L 4.4257812 45.617188 L 7.0019531 36.425781 A 1.0001 1.0001 0 0 0 6.9023438 35.646484 C 5.0606869 32.523592 4 28.890107 4 25 C 4 13.390466 13.390466 4 25 4 z M 16.642578 13 C 16.001539 13 15.086045 13.23849 14.333984 14.048828 C 13.882268 14.535548 12 16.369511 12 19.59375 C 12 22.955271 14.331391 25.855848 14.613281 26.228516 L 14.615234 26.228516 L 14.615234 26.230469 C 14.588494 26.195329 14.973031 26.752191 15.486328 27.419922 C 15.999626 28.087653 16.717405 28.96464 17.619141 29.914062 C 19.422612 31.812909 21.958282 34.007419 25.105469 35.349609 C 26.554789 35.966779 27.698179 36.339417 28.564453 36.611328 C 30.169845 37.115426 31.632073 37.038799 32.730469 36.876953 C 33.55263 36.755876 34.456878 36.361114 35.351562 35.794922 C 36.246248 35.22873 37.12309 34.524722 37.509766 33.455078 C 37.786772 32.688244 37.927591 31.979598 37.978516 31.396484 C 38.003976 31.104927 38.007211 30.847602 37.988281 30.609375 C 37.969311 30.371148 37.989581 30.188664 37.767578 29.824219 C 37.302009 29.059804 36.774753 29.039853 36.224609 28.767578 C 35.918939 28.616297 35.048661 28.191329 34.175781 27.775391 C 33.303883 27.35992 32.54892 26.991953 32.083984 26.826172 C 31.790239 26.720488 31.431556 26.568352 30.914062 26.626953 C 30.396569 26.685553 29.88546 27.058933 29.587891 27.5 C 29.305837 27.918069 28.170387 29.258349 27.824219 29.652344 C 27.819619 29.649544 27.849659 29.663383 27.712891 29.595703 C 27.284761 29.383815 26.761157 29.203652 25.986328 28.794922 C 25.2115 28.386192 24.242255 27.782635 23.181641 26.847656 L 23.181641 26.845703 C 21.603029 25.455949 20.497272 23.711106 20.148438 23.125 C 20.171937 23.09704 20.145643 23.130901 20.195312 23.082031 L 20.197266 23.080078 C 20.553781 22.728924 20.869739 22.309521 21.136719 22.001953 C 21.515257 21.565866 21.68231 21.181437 21.863281 20.822266 C 22.223954 20.10644 22.02313 19.318742 21.814453 18.904297 L 21.814453 18.902344 C 21.828863 18.931014 21.701572 18.650157 21.564453 18.326172 C 21.426943 18.001263 21.251663 17.580039 21.064453 17.130859 C 20.690033 16.232501 20.272027 15.224912 20.023438 14.634766 L 20.023438 14.632812 C 19.730591 13.937684 19.334395 13.436908 18.816406 13.195312 C 18.298417 12.953717 17.840778 13.022402 17.822266 13.021484 L 17.820312 13.021484 C 17.450668 13.004432 17.045038 13 16.642578 13 z M 16.642578 15 C 17.028118 15 17.408214 15.004701 17.726562 15.019531 C 18.054056 15.035851 18.033687 15.037192 17.970703 15.007812 C 17.906713 14.977972 17.993533 14.968282 18.179688 15.410156 C 18.423098 15.98801 18.84317 16.999249 19.21875 17.900391 C 19.40654 18.350961 19.582292 18.773816 19.722656 19.105469 C 19.863021 19.437122 19.939077 19.622295 20.027344 19.798828 L 20.027344 19.800781 L 20.029297 19.802734 C 20.115837 19.973483 20.108185 19.864164 20.078125 19.923828 C 19.867096 20.342656 19.838461 20.445493 19.625 20.691406 C 19.29998 21.065838 18.968453 21.483404 18.792969 21.65625 C 18.639439 21.80707 18.36242 22.042032 18.189453 22.501953 C 18.016221 22.962578 18.097073 23.59457 18.375 24.066406 C 18.745032 24.6946 19.964406 26.679307 21.859375 28.347656 C 23.05276 29.399678 24.164563 30.095933 25.052734 30.564453 C 25.940906 31.032973 26.664301 31.306607 26.826172 31.386719 C 27.210549 31.576953 27.630655 31.72467 28.119141 31.666016 C 28.607627 31.607366 29.02878 31.310979 29.296875 31.007812 L 29.298828 31.005859 C 29.655629 30.601347 30.715848 29.390728 31.224609 28.644531 C 31.246169 28.652131 31.239109 28.646231 31.408203 28.707031 L 31.408203 28.708984 L 31.410156 28.708984 C 31.487356 28.736474 32.454286 29.169267 33.316406 29.580078 C 34.178526 29.990889 35.053561 30.417875 35.337891 30.558594 C 35.748225 30.761674 35.942113 30.893881 35.992188 30.894531 C 35.995572 30.982516 35.998992 31.07786 35.986328 31.222656 C 35.951258 31.624292 35.8439 32.180225 35.628906 32.775391 C 35.523582 33.066746 34.975018 33.667661 34.283203 34.105469 C 33.591388 34.543277 32.749338 34.852514 32.4375 34.898438 C 31.499896 35.036591 30.386672 35.087027 29.164062 34.703125 C 28.316336 34.437036 27.259305 34.092596 25.890625 33.509766 C 23.114812 32.325956 20.755591 30.311513 19.070312 28.537109 C 18.227674 27.649908 17.552562 26.824019 17.072266 26.199219 C 16.592866 25.575584 16.383528 25.251054 16.208984 25.021484 L 16.207031 25.019531 C 15.897202 24.609805 14 21.970851 14 19.59375 C 14 17.077989 15.168497 16.091436 15.800781 15.410156 C 16.132721 15.052495 16.495617 15 16.642578 15 z"></path>
                    </svg>
                    <a href="https://whatsapp.com/channel/0029Vb0IeCWHLHQVZP5EbQ1B" target="_blank" className="hover:text-yellow-300">Join WhatsApp Channel</a>
                  </li>
                  <li className="hidden items-center gap-2">
                    <Send className="w-5 h-5 text-yellow-500" />
                    <a href="https://t.me/rankmarg" target="_blank" className="hover:text-yellow-300">Join Telegram</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <InstagramLogoIcon className="w-5 h-5 text-yellow-500" />
                    <a href="https://www.instagram.com/rankmarg/" target="_blank" className="hover:text-yellow-300">Follow on Instagram</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 50 50" className="text-yellow-500">
                      <path fill="currentColor" d="M 24.402344 9 C 17.800781 9 11.601563 9.5 8.300781 10.199219 C 6.101563 10.699219 4.199219 12.199219 3.800781 14.5 C 3.402344 16.898438 3 20.5 3 25 C 3 29.5 3.398438 33 3.898438 35.5 C 4.300781 37.699219 6.199219 39.300781 8.398438 39.800781 C 11.902344 40.5 17.898438 41 24.5 41 C 31.101563 41 37.097656 40.5 40.597656 39.800781 C 42.800781 39.300781 44.699219 37.800781 45.097656 35.5 C 45.5 33 46 29.402344 46.097656 24.902344 C 46.097656 20.402344 45.597656 16.800781 45.097656 14.300781 C 44.699219 12.101563 42.800781 10.5 40.597656 10 C 37.097656 9.5 31 9 24.402344 9 Z M 24.402344 11 C 31.601563 11 37.398438 11.597656 40.199219 12.097656 C 41.699219 12.5 42.898438 13.5 43.097656 14.800781 C 43.699219 18 44.097656 21.402344 44.097656 24.902344 C 44 29.199219 43.5 32.699219 43.097656 35.199219 C 42.800781 37.097656 40.800781 37.699219 40.199219 37.902344 C 36.597656 38.601563 30.597656 39.097656 24.597656 39.097656 C 18.597656 39.097656 12.5 38.699219 9 37.902344 C 7.5 37.5 6.300781 36.5 6.101563 35.199219 C 5.300781 32.398438 5 28.699219 5 25 C 5 20.398438 5.402344 17 5.800781 14.902344 C 6.101563 13 8.199219 12.398438 8.699219 12.199219 C 12 11.5 18.101563 11 24.402344 11 Z M 19 17 L 19 33 L 33 25 Z M 21 20.402344 L 29 25 L 21 29.597656 Z"></path>
                    </svg>
                    <a href="https://www.youtube.com/@RankMarg" target="_blank" className="hover:text-yellow-300">Subscribe on YouTube</a>
                  </li>

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