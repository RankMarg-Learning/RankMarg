'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"

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

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-yellow-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-yellow-600">EduTech</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
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
              Don&apos;t make learning complicated
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-yellow-700 mb-12 max-w-2xl mx-auto"
            >
              No more struggling with complex study materials or getting lost in endless notes.
              Master your subjects with our interactive learning platform designed for NEET & JEE success.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="text-lg px-8 py-6 bg-yellow-500 hover:bg-yellow-600 text-white">
                Start learning free
              </Button>
            </motion.div>
          </div>

          {/* Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative mt-20 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl transform rotate-2" />
                <Image
                  src="/placeholder.svg?height=600&width=300"
                  width={300}
                  height={600}
                  alt="Study Dashboard"
                  className="relative rounded-3xl shadow-2xl border border-yellow-200"
                />
              </div>
              <div className="relative mt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-3xl transform -rotate-2" />
                <Image
                  src="/placeholder.svg?height=600&width=300"
                  width={300}
                  height={600}
                  alt="Interactive Learning"
                  className="relative rounded-3xl shadow-2xl border border-yellow-200"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-800">Our Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-yellow-800">Smart Learning Path</h3>
                <p className="text-yellow-600">Personalized study plans that adapt to your learning style and pace</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-yellow-800">Interactive Content</h3>
                <p className="text-yellow-600">Engage with dynamic study materials and real-time practice questions</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-yellow-800">Progress Tracking</h3>
                <p className="text-yellow-600">Monitor your improvement with detailed analytics and insights</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-yellow-100 py-24">
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
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-800">Rewards & Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { tier: "Bronze", rewards: ["Access to basic courses", "Weekly quizzes", "Community forum access"] },
                { tier: "Silver", rewards: ["All Bronze rewards", "Personalized study plans", "Monthly mock tests"] },
                { tier: "Gold", rewards: ["All Silver rewards", "1-on-1 mentoring sessions", "Guaranteed score improvement"] },
              ].map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-yellow-50 p-6 rounded-lg shadow-lg border-2 border-yellow-200"
                >
                  <h3 className="text-xl font-semibold mb-4 text-yellow-800">{tier.tier}</h3>
                  <ul className="space-y-2">
                    {tier.rewards.map((reward, rewardIndex) => (
                      <li key={rewardIndex} className="flex items-center text-yellow-600">
                        <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-yellow-100 py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-800">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {[
                { question: "How does the adaptive learning work?", answer: "Our AI-powered system analyzes your performance and adjusts your study plan in real-time, focusing on areas where you need the most improvement." },
                { question: "Can I access EduTech on mobile devices?", answer: "Yes! EduTech is fully responsive and can be accessed on smartphones, tablets, and computers." },
                { question: "How often is the content updated?", answer: "We update our content regularly to align with the latest NEET and JEE syllabus changes and exam patterns." },
                { question: "Is there a free trial available?", answer: "Yes, we offer a 7-day free trial so you can experience the full benefits of our platform before committing." },
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
                <h3 className="text-2xl font-bold mb-4">EduTech</h3>
                <p className="text-yellow-200">Empowering students to achieve their dreams in NEET and JEE.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-yellow-300">Home</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Features</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Pricing</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-yellow-300">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Cookie Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Connect</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-yellow-300">Facebook</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Twitter</a></li>
                  <li><a href="#" className="hover:text-yellow-300">Instagram</a></li>
                  <li><a href="#" className="hover:text-yellow-300">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-yellow-700 text-center">
              <p>&copy; 2024 EduTech. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}