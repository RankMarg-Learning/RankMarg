import React from 'react';
import { 
  Users, 
  Target, 
  Zap,
  Award,
  BookOpen,
  TrendingUp,
  Brain,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Lightbulb,
  BarChart3,
  Rocket,
  Heart,
  Globe,
  Trophy,
  
} from 'lucide-react';

export const metadata = {
    title: 'About Us | RankMarg',
    description:
      'Learn about RankMarg - India\'s leading AI-powered practice platform for JEE & NEET preparation. Discover our mission, vision, and commitment to transforming exam preparation.',
    openGraph: {
      title: 'About RankMarg – Revolutionizing JEE & NEET Preparation',
      description:
        'Discover how RankMarg is empowering thousands of students with intelligent practice, personalized analytics, and AI-driven insights for JEE & NEET success.',
      url: 'https://rankmarg.in/about',
      type: 'website',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };

const aboutContent = {
  title: "About RankMarg",
  intro: "We're on a mission to revolutionize how students prepare for India's most competitive exams. RankMarg combines cutting-edge AI technology with deep understanding of JEE and NEET patterns to create the most effective practice platform.",
  mission: {
    heading: "Our Mission",
    description: "To democratize quality exam preparation by making intelligent, personalized practice accessible to every JEE and NEET aspirant across India, regardless of their location or background.",
    icon: Target
  },
  vision: {
    heading: "Our Vision",
    description: "To become India's most trusted companion for competitive exam success, where every student achieves their potential through smart, data-driven preparation.",
    icon: Rocket
  },
  story: {
    heading: "Our Story",
    description: "Born from the frustration of endless practice without direction, RankMarg was created by educators and technologists who understood that practice without intelligence is just repetition. We believe every student deserves personalized guidance that adapts to their unique learning journey.",
    highlights: [
      "Founded by IIT alumni and education experts",
      "Powered by advanced AI and machine learning",
      "Trusted by thousands of students across India",
      "Continuously evolving based on student feedback"
    ]
  },
  features: {
    heading: "What Makes Us Different",
    items: [
      {
        title: "AI-Powered Analytics",
        description: "Advanced algorithms track your progress and identify weak areas with precision",
        icon: Brain,
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Personalized Practice",
        description: "Every question is selected based on your performance and learning patterns",
        icon: Target,
        color: "from-green-500 to-green-600"
      },
      {
        title: "Real-time Insights",
        description: "Instant feedback and detailed analysis after every practice session",
        icon: BarChart3,
        color: "from-purple-500 to-purple-600"
      },
      {
        title: "Mastery Tracking",
        description: "Visual progress indicators showing your journey from novice to expert",
        icon: TrendingUp,
        color: "from-orange-500 to-orange-600"
      },
      {
        title: "Mistake Learning",
        description: "Transform your errors into learning opportunities with our mistake analysis",
        icon: Lightbulb,
        color: "from-red-500 to-red-600"
      },
      {
        title: "Exam Simulation",
        description: "Practice in conditions that mirror the actual JEE and NEET experience",
        icon: Clock,
        color: "from-indigo-500 to-indigo-600"
      }
    ]
  },
  values: {
    heading: "Our Core Values",
    items: [
      {
        title: "Student-First Approach",
        description: "Every decision we make prioritizes student success and learning outcomes",
        icon: Heart
      },
      {
        title: "Innovation & Excellence",
        description: "We continuously push boundaries to deliver the best learning experience",
        icon: Star
      },
      {
        title: "Accessibility",
        description: "Quality education should be accessible to students from all backgrounds",
        icon: Globe
      },
      {
        title: "Data Privacy",
        description: "Your learning data is secure and used only to enhance your experience",
        icon: Shield
      }
    ]
  },
  achievements: {
    heading: "Our Impact",
    stats: [
      {
        number: "50,000+",
        label: "Students Empowered",
        icon: Users
      },
      {
        number: "10M+",
        label: "Questions Practiced",
        icon: BookOpen
      },
      {
        number: "95%",
        label: "Improvement Rate",
        icon: TrendingUp
      },
      {
        number: "24/7",
        label: "Platform Availability",
        icon: Clock
      }
    ]
  },
  commitment: {
    heading: "Our Commitment to You",
    description: "We're not just a platform; we're your preparation partner. Our commitment goes beyond providing questions – we're dedicated to understanding your unique learning style and helping you achieve your dreams.",
    promises: [
      "Continuous platform improvements based on your feedback",
      "Regular content updates aligned with latest exam patterns",
      "Responsive support to address your concerns quickly",
      "Transparent progress tracking with no hidden metrics"
    ]
  }
};

const AboutPage = () => {
  const FeatureCard = ({ item, index }) => {
    const IconComponent = item.icon;
    return (
      <div 
        className={`group relative overflow-hidden rounded-2xl p-6 bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300`}
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform duration-300" />
        <div className="relative">
          <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-r ${item.color} text-white`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    );
  };

  const ValueCard = ({ item, index }) => {
    const IconComponent = item.icon;
    return (
      <div 
        className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 hover:border-primary-300 hover:to-primary-100 transition-all duration-300"
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform duration-300" />
        <div className="relative">
          <div className="inline-flex p-3 rounded-xl mb-4 bg-primary-100 text-primary-600">
            <IconComponent className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    );
  };

  const StatCard = ({ stat, index }) => {
    const IconComponent = stat.icon;
    return (
      <div 
        className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300 group"
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
        <div className="text-gray-600 text-sm">{stat.label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
      <div className="relative">
        {/* Header */}
        <div className="text-center py-16 px-4 transition-all duration-1000 opacity-100 translate-y-0">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-primary-800 bg-clip-text text-transparent mb-6">
              About RankMarg
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {aboutContent.intro}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Mission & Vision */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 shadow-md text-white h-full transition-all duration-700 delay-200 opacity-100 translate-y-0">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{aboutContent.mission.heading}</h3>
                </div>
                <p className="text-primary-100 leading-relaxed text-lg">
                  {aboutContent.mission.description}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 shadow-md text-white h-full transition-all duration-700 delay-300 opacity-100 translate-y-0">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{aboutContent.vision.heading}</h3>
                </div>
                <p className="text-indigo-100 leading-relaxed text-lg">
                  {aboutContent.vision.description}
                </p>
              </div>
            </div>

            {/* Our Story */}
            <div className="lg:col-span-12 transition-all duration-700 delay-400 opacity-100 translate-y-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{aboutContent.story.heading}</h3>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
                    {aboutContent.story.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {aboutContent.story.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="lg:col-span-12 transition-all duration-700 delay-500 opacity-100 translate-y-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{aboutContent.features.heading}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aboutContent.features.items.map((item, index) => (
                    <FeatureCard key={index} item={item} index={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="lg:col-span-12 transition-all duration-700 delay-600 opacity-100 translate-y-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{aboutContent.values.heading}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aboutContent.values.items.map((item, index) => (
                    <ValueCard key={index} item={item} index={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="lg:col-span-12 transition-all duration-700 delay-700 opacity-100 translate-y-0">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-md text-white">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{aboutContent.achievements.heading}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {aboutContent.achievements.stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Commitment */}
            <div className="lg:col-span-12 transition-all duration-700 delay-800 opacity-100 translate-y-0">
              <div className="bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 rounded-3xl p-8 shadow-md">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{aboutContent.commitment.heading}</h3>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
                    {aboutContent.commitment.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {aboutContent.commitment.promises.map((promise, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{promise}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="lg:col-span-12 transition-all duration-700 delay-900 opacity-100 translate-y-0">
              <div className="text-center space-y-3">
                <span className="text-gray-800">©RankMarg {new Date().getFullYear()}, All rights reserved.</span>
                <p className="text-gray-700 max-w-4xl mx-auto text-sm">
                  All content, logic, and analytics systems on RankMarg are protected by copyright. Unauthorized use or duplication is strictly prohibited. RankMarg® is a registered trademark in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;