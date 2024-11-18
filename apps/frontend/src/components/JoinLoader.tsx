"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function JoinLoader() {
  const [currentIcon, setCurrentIcon] = useState(0)
  const icons = ['🧠', '📚', '🎓', '💡']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-yellow-50 rounded-lg p-6 shadow-xl max-w-[300px] w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            {/* Orbiting dots */}
            <AnimatePresence>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    rotate: 360,
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "linear"
                    }
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '-6px -6px'
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Central spinning icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-4xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {icons[currentIcon]}
            </motion.div>
          </div>
          
          {/* Loading text */}
          <div className="mt-4 text-center">
            <motion.p
              className="text-sm font-medium text-yellow-800"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Finding your study partner
            </motion.p>
            <p className="text-xs text-yellow-600 mt-1">
              Average wait time: 30s
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}