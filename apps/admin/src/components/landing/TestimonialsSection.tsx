'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { Star, Quote, TrendingUp, Award } from 'lucide-react';

const testimonials = [
  {
    initials: "AS",
    name: "Aarav Sharma",
    title: "NEET 2024 Aspirant",
    content:
      "The adaptive practice sessions were a game-changer. RankMarg identified my weak topics in Organic Chemistry and created focused sessions. My accuracy improved from 65% to 89% in just 3 months!",
    rating: 5,
    improvement: "+24% accuracy",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    initials: "MG",
    name: "Meera Gupta",
    title: "JEE 2024 Candidate",
    content:
      "The mistake tracker feature helped me understand my error patterns. I realized I was making silly calculation mistakes. After tracking and practicing, my score jumped by 45 marks!",
    rating: 5,
    improvement: "+45 marks",
    bgColor: "from-purple-50 to-purple-100",
  },
  {
    initials: "TN",
    name: "Tanmay Nair",
    title: "JEE 2024 Candidate",
    content:
      "Smart hints without revealing answers taught me to think strategically. The solving strategies section helped me speed up by 30%. I could attempt 10 more questions in the same time!",
    rating: 5,
    improvement: "+30% speed",
    bgColor: "from-green-50 to-green-100",
  },
  {
    initials: "SR",
    name: "Sneha Reddy",
    title: "NEET 2024 Student",
    content:
      "The step-by-step solutions with tricks and exceptions are gold! The common mistakes section saved me from making typical errors. My Biology score went from 310 to 358 out of 360!",
    rating: 5,
    improvement: "+48 marks Bio",
    bgColor: "from-pink-50 to-pink-100",
  },
  {
    initials: "KV",
    name: "Kunal Verma",
    title: "Repeater Batch Student",
    content:
      "As a dropper, I needed structure. The curriculum management and mastery system kept me organized. The analytics dashboard showed my weekly progress, which kept me motivated throughout!",
    rating: 5,
    improvement: "200+ rank jump",
    bgColor: "from-orange-50 to-orange-100",
  },
  {
    initials: "RD",
    name: "Riya Das",
    title: "Class 12 Student",
    content:
      "Mock tests with detailed analysis were crucial. The platform showed me I was weak in Thermodynamics and strong in Mechanics. Focused practice helped me improve my weak areas significantly.",
    rating: 5,
    improvement: "+35% Physics",
    bgColor: "from-yellow-50 to-yellow-100",
  },
  {
    initials: "YN",
    name: "Yash Nanda",
    title: "JEE 2024 Aspirant",
    content:
      "The heatmap showing daily practice was so motivating! Seeing my 90-day streak pushed me to stay consistent. The platform made preparation feel like a journey, not a burden.",
    rating: 5,
    improvement: "90-day streak",
    bgColor: "from-indigo-50 to-indigo-100",
  },
  {
    initials: "PJ",
    name: "Priya Joshi",
    title: "NEET 2024 Aspirant",
    content:
      "The topic-wise and subject-wise mock tests helped me identify gaps early. The performance comparison with previous weeks showed exactly where I improved and where I needed work.",
    rating: 5,
    improvement: "+52 marks",
    bgColor: "from-teal-50 to-teal-100",
  },
];

export default function InfiniteTestimonialScroll() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: ['0%', '-100%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 180,
          ease: 'linear',
        },
      },
    });
  }, [controls]);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-6xl mx-auto text-center mb-12 px-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full mb-4">
          <Award className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-700">Success Stories</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          What Our Toppers Say
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real results from students who transformed their NEET/JEE preparation with RankMarg's intelligent platform
        </p>
      
      </div>

      {/* Blur Overlays */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="relative overflow-hidden">
        <motion.div
          className="flex w-max gap-6 px-16 py-4"
          animate={controls}
        >
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={idx}
              className={`min-w-[380px] max-w-md bg-gradient-to-br ${t.bgColor} rounded-2xl shadow-md p-6 border-2  flex-shrink-0 hover:scale-105 transition-transform duration-300`}
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-gray-400 opacity-50" />
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-bold text-green-700">{t.improvement}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-800 text-sm mb-6 leading-relaxed italic">
                "{t.content}"
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                ))}
                {Array.from({ length: 5 - t.rating }).map((_, i) => (
                  <Star key={`empty-${i}`} size={16} className="text-gray-300" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t-2 border-white">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center text-lg shadow-lg">
                  {t.initials}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-700 font-medium">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

     
    </section>
  );
}
