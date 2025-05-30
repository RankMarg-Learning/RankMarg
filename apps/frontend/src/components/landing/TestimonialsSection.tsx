'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    initials: "AS",
    name: "Aarav Sharma",
    title: "NEET 2024 Aspirant",
    content:
      "Rankmarg made revision so easy. I was able to cover important topics daily without stress.",
    rating: 5,
  },
  {
    initials: "MG",
    name: "Meera Gupta",
    title: "JEE 2024 Candidate",
    content:
      "Mock test analysis showed me exactly where I was losing marks. Helped me boost my accuracy.",
    rating: 4,
  },
  {
    initials: "TN",
    name: "Tanmay Nair",
    title: "JEE Advanced Qualifier",
    content:
      "Loved the smart suggestions before practice. Felt like a personal mentor guiding me.",
    rating: 5,
  },
  {
    initials: "SR",
    name: "Sneha Reddy",
    title: "NEET 2024 Student",
    content:
      "The mistake tracker changed how I revised. I started fixing the root cause of my errors.",
    rating: 5,
  },
  {
    initials: "KV",
    name: "Kunal Verma",
    title: "Repeater Batch Student",
    content:
      "Rankmarg's daily practice sessions made my prep consistent. Scored much better in tests.",
    rating: 4,
  },
  {
    initials: "RD",
    name: "Riya Das",
    title: "Class 12 Student",
    content:
      "Performance feedback every week was so motivating. I knew exactly what to improve.",
    rating: 5,
  },
  {
    initials: "YN",
    name: "Yash Nanda",
    title: "JEE Mains Aspirant",
    content:
      "Quick insights after each session saved me hours of manual review. Best decision to join!",
    rating: 4,
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
          duration: 75,
          ease: 'linear',
        },
      },
    });
  }, [controls]);

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-10 px-4">
        <h2 className="text-4xl font-bold">What Toppers & Students Say</h2>
        <p className="text-gray-600 mt-2">
          Real stories from students who transformed their NEET/JEE preparation with Rankmarg.
        </p>
      </div>

      {/* Blur Overlays */}
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="relative overflow-hidden">
        <motion.div
          className="flex w-max gap-6 px-16"
          animate={controls}
        >
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={idx}
              className="min-w-[300px] max-w-xs bg-white rounded-2xl shadow-md p-6 border flex-shrink-0"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-yellow-400 text-black font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg">
                  {t.initials}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
                {Array.from({ length: 5 - t.rating }).map((_, i) => (
                  <Star key={`empty-${i}`} size={16} className="text-gray-300" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-4">"{t.content}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
