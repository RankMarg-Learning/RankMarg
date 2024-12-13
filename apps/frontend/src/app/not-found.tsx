'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, SunMedium } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 overflow-hidden">
      <div className="text-center text-yellow-900 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-extrabold tracking-widest mb-4">404</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-4xl font-semibold mb-4">Oops! Page Not Found</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-yellow-900 text-yellow-100 rounded-full font-semibold hover:bg-yellow-800 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2" size={20} />
            Return Home
          </Link>
        </motion.div>
      </div>
      <motion.div
        className="absolute top-10 right-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <SunMedium className="text-yellow-600" size={60} />
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#FCD34D" fillOpacity="0.5" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,122.7C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  )
}

