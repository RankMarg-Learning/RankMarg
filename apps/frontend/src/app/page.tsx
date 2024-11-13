"use client"
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Users, BookOpen, Clock, Menu, X, Brain, Trophy, BarChart2, Gamepad, UserPlus, Settings, PlayCircle, TrendingUp, ChevronRight } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-yellow-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="#" className="flex items-center space-x-2">
              <motion.div 
                className="w-8 h-8 bg-yellow-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="font-bold text-xl text-yellow-600">PrepMaster</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                Features
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                How It Works
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                Success Stories
              </Link>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Link href="/challenge">
                Get Started 
                </Link>
              </Button>
            </nav>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-yellow-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                  Features
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                  How It Works
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors">
                  Success Stories
                </Link>
                <Button  className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                  <Link href="/challenge">
                  Get Started
                  </Link>
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </header>
      <main className="pt-16">
        <section className="py-12 md:py-20 px-4 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
              <motion.div 
                className="md:w-1/2 space-y-8 relative z-10"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-left text-center font-bold leading-tight lg:text-5xl text-gray-800">
                  Unlock Your Potential with Our Smart Learning Platform
                </h1>
                <p className="text-lg md:text-left text-center text-gray-600 max-w-lg">
                  Prepare for JEE & NEET like never before with personalized question banks, real-time challenges, and gamified learning.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-white text-yellow-600 hover:bg-yellow-100 rounded-full px-8 py-6 text-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                  Start Your Journey
                </Button>
                <Link href="#features" className="group inline-flex items-center text-yellow-600 hover:text-black transition-colors">
                  <span className="mr-2">Explore Features</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              </motion.div>
              <motion.div 
                className="md:w-1/2 relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative z-10 bg-yellow-100 rounded-3xl p-8 shadow-xl">
                  <Image
                    src="/hero.png"
                    alt="Students using PrepMaster platform"
                    width={400}
                    height={400}
                    className="rounded-2xl mx-auto"
                  />
                  {/* Floating Stats */}
                  <motion.div 
                    className="absolute top-4 left-4 bg-white rounded-2xl p-3 shadow-lg flex items-center space-x-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Users className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-bold text-sm">10M+</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/3 right-4 bg-white rounded-2xl p-3 shadow-lg flex items-center space-x-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <BookOpen className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-bold text-sm">50k+</div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-3 shadow-lg flex items-center space-x-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-bold text-sm">24/7</div>
                      <div className="text-xs text-gray-500">Support</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
          {/* Background Elements */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200 rounded-full blur-3xl opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent" />
        </section>

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

        <section className="py-20 px-4 bg-yellow-100">
          <div className="container mx-auto">
            <motion.h2 
              className="text-3xl font-bold mb-12 text-center text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              How It Works
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 lg:grid-cols-5 gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                { title: "Sign Up", description: "Create your account in minutes.", icon: UserPlus },
                { title: "Personalize", description: "Select subjects and topics you want to focus on.", icon: Settings },
                { title: "Start Solving", description: "Access your smart question bank and begin practicing.", icon: PlayCircle },
                { title: "Challenge Yourself", description: "Join real-time challenges with your peers.", icon: Trophy },
                { title: "Analyze & Improve", description: "Review performance analytics to identify areas for growth.", icon: TrendingUp },
              ].map((step, index) => (
                <motion.div key={index} className="flex flex-col items-center text-center" variants={fadeInUp}>
                  <motion.div 
                    className="bg-yellow-500 rounded-full p-4 mb-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <motion.h2 
              className="text-3xl font-bold mb-12 text-center text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Success Stories from Our Students
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                { name: "Priya S.", quote: "I improved my physics scores by 30% in just 3 months thanks to the smart question bank and real-time challenges!", achievement: "JEE Rank: 342" },
                { name: "Rahul M.", quote: "The gamified learning approach kept me motivated throughout my NEET preparation. It made studying fun!", achievement: "NEET Score: 650/720" },
                { name: "Ananya K.", quote: "The performance analytics helped me identify my weak areas quickly. I could focus my efforts where they were needed most.", achievement: "JEE Rank: 127" },
              ].map((testimonial, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-yellow-50 border-yellow-100 h-full">
                    <CardHeader>
                      <CardTitle>{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.achievement}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="italic">"{testimonial.quote}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-yellow-500 text-white">
          <div className="container mx-auto text-center">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Experience the Platform
            </motion.h2>
            <motion.p 
              className="mb-8 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get a taste of our real-time challenges and smart question bank.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button className="bg-white text-yellow-600 hover:bg-yellow-100 rounded-full px-8 py-6 text-lg">
                Try It Now
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 px-4 border-t border-gray-200">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">PrepMaster</h3>
              <p className="text-gray-600">Empowering students to excel in JEE and NEET exams.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Features</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">© 2024 PrepMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}