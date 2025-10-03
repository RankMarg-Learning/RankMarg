"use client"
import {
  Target,
  Lightbulb,
  BookOpen,
  AlertCircle,
  FileText,
  Award,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Adaptive Practice Sessions",
    description: "Personalized question sets based on your weak topics, current syllabus, and revision needs across Physics, Chemistry, Mathematics, and Biology.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Lightbulb,
    title: "Smart Hints Without Answers",
    description: "Get strategic hints that guide your thinking process without revealing the solution. Build problem-solving skills naturally.",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    icon: BookOpen,
    title: "Question Solving Strategies",
    description: "Learn proven strategies for each question type. Master the art of approaching problems efficiently and systematically.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: AlertCircle,
    title: "Common Mistakes to Avoid",
    description: "Understand typical errors students make and how to prevent them. Learn from others' mistakes before making your own.",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    icon: FileText,
    title: "Step-by-Step Solutions",
    description: "Comprehensive solutions with tricks, exceptions, edge cases, and detailed explanations for complete understanding.",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Award,
    title: "Mastery System",
    description: "Track your mastery percentage at subject, topic, and subtopic levels. Know exactly where you stand in your preparation.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: ClipboardCheck,
    title: "Comprehensive Mock Tests",
    description: "Full-length, subject-wise, and topic-wise mock tests that simulate real NEET/JEE exam conditions.",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: TrendingUp,
    title: "Mistake Tracker System",
    description: "Automatically categorize and track every type of mistake you make. Get detailed insights into your error patterns.",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: BarChart3,
    title: " Analytics Dashboard",
    description: "Visualize your performance with heatmaps, weekly comparisons, accuracy trends, and motivational progress tracking.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: Calendar,
    title: "Curriculum Management",
    description: "Smart tracking of completed, current, and pending topics. Stay organized with your entire NEET/JEE syllabus.",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
  }
];

export default function FeatureSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-primary-50" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary-700" />
            <span className="text-sm font-semibold text-primary-700">Complete Learning Ecosystem</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            10 Powerful Features to Ace
            <span className="block text-primary-700">NEET & JEE</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform your preparation from average to exceptional. 
            Built by experts, trusted by toppers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-2xl ${feature.bgColor} p-6 border-2 border-transparent hover:${feature.bgColor} transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {feature.description}
                </p>

                
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
