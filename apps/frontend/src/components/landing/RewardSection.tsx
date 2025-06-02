import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

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
const RewardSection = () => {
  return (
    <section id="ranking" className="min-h-screen bg-yellow-50 text-yellow-900 p-8 hidden">
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
  )
}

export default RewardSection