'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"
import {  Brain, Trophy, BarChart2, Gamepad } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'

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
    }
  ]

export default function Home() {
  const { data: session,status } = useSession();

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
          status === "loading" ? null: status === "unauthenticated" ? (
            <div className="flex gap-1 md:gap-2">
            <Link href={"/sign-in"}>
              {" "}
              <Button>Login</Button>
            </Link>
            <Link href={"/sign-up"}>
              {" "}
              <Button>Register</Button>
            </Link>
          </div>):(
             <Link href={`/u/${session.user.username}`}>
             <p className='hover:underline'> Welcome, {session.user.name}! </p>
            </Link>
          )

        }
              
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Decorative blobs */}
          <BlobShape className="absolute top-0 left-0 w-72 h-72 text-yellow-200 -translate-x-1/2 -translate-y-1/2" />
          <BlobShape className="absolute top-1/2 right-0 w-64 h-64 text-yellow-300 translate-x-1/3" />
          <BlobShape className="absolute bottom-0 left-1/2 w-80 h-80 text-yellow-100 -translate-x-1/2 translate-y-1/4" />

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-yellow-900 mb-8"
            >
              Compete, Learn, Achieve Dream
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-yellow-700 mb-12 max-w-2xl mx-auto"
            >
              Learn smarter with our platform made for NEET and JEE students. Practice with topic-wise questions, compete in fun challenges, and track your progress to improve your rank and score better!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href={'/challenge'}  className="text-lg px-8 py-4 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white">
                Start Challenging Yourself
              </Link>
            </motion.div>
          </div>

          {/* Laptop Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative mt-20 max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-3xl transform rotate-1" />
              <div className="relative">
                <Image
                  src="/Desktop.png"
                  width={1200}
                  height={800}
                  alt="EduTech Platform Dashboard"
                  className="rounded-3xl shadow-2xl border-2 border-yellow-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-3xl" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-semibold transform rotate-3">
              Boost your learning!
            </div>
          </motion.div>
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
                  description: "Access a wide range of expertly curated questions tailored to JEE and NEET. With AI-powered recommendations, our question bank adapts to your progress.",
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