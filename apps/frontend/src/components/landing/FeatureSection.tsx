import {
  CalendarCheck,
  BrainCog,
  TrendingUp,
  GaugeCircle,
  Repeat,
  LineChart,
  Sparkles,
  Award,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Daily Personalized Practice",
    description: "Get dynamic question sets daily based on strengths, weaknesses, and syllabus alignment.",
  },
  {
    icon: BrainCog,
    title: "Smart Mistake Tracker",
    description: "AI highlights key mistakes and gives focused revision prompts to strengthen concepts.",
  },
  {
    icon: TrendingUp,
    title: "Rank & Score Boost Engine",
    description: "Advanced logic focuses on high-weightage questions to boost scores and rank.",
  },
  {
    icon: GaugeCircle,
    title: "Mastery Tracking (Subtopic-Level)",
    description: "See your mastery progress for every concept down to the subtopic.",
  },
  {
    icon: Repeat,
    title: "Spaced Revision Algorithm",
    description: "Key concepts are repeated intelligently for long-term retention and exam readiness.",
  },
  {
    icon: LineChart,
    title: "Progress Analytics Dashboard",
    description: "Visual insights into performance, accuracy, speed, and subject coverage.",
  },
  {
    icon: Sparkles,
    title: "Goal-Oriented Suggestions",
    description: "Timely tips help you revise, prepare, and stay on track for exam success.",
  },
  {
    icon: Award,
    title: "Proven Student Outcomes",
    description: "Thousands of students improved scores and cracked exams with Rankmarg.",
  },
];

export default function FeatureSection() {
  return (
    <section >
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Why RankMarg Works
        </h2>
        <p className="text-gray-700  mt-2">
          Built for serious JEE/NEET aspirants who want results, not just resources.
        </p>
      </div>
      <div className="grid grid-cols-2  lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="p-6 rounded-xl shadow-sm bg-primary-100/40  text-center  transition-shadow duration-200 border border-yellow-400">
            <feature.icon className="w-8 h-8 text-gray-800 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-700  mt-2">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
