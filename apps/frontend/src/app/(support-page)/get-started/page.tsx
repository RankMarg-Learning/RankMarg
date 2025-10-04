import React from 'react';
import { 
  Play,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  FileText,
  Brain,
  Star,
  Lightbulb,
  AlertCircle,
  Mail
} from 'lucide-react';

const GetStartedPage = () => {
  

  
  const steps = [
    {
      number: "01",
      title: "Choose Your Path",
      description: "Select JEE or NEET based on your career goals",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      actions: ["Select exam type", "Choose your subjects", "Set study preferences"]
    },
    {
      number: "02",
      title: "Start Personalized Practice",
      description: "Begin with our tailored practice sessions designed for your needs",
      icon: Brain,
      color: "from-primary-500 to-primary-600",
      actions: ["Access personalized questions", "Practice by topics", "Track your progress"]
    },
    {
      number: "03",
      title: "Learn & Improve",
      description: "Review solutions and strengthen your weak areas",
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      actions: ["Study detailed solutions", "Focus on weak topics", "Build conceptual clarity"]
    },
    {
      number: "04",
      title: "Track Progress",
      description: "Monitor your improvement and stay motivated",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      actions: ["View performance analytics", "Set daily targets", "Celebrate milestones"]
    }
  ];

  const features = [
    {
      title: "Personalized Practice",
      description: "Customized practice sessions tailored to your learning style and pace",
      icon: Brain,
      color: "text-primary-600"
    },
    {
      title: "Topic-wise Learning",
      description: "Organized content by subjects and topics for structured preparation",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Detailed Solutions",
      description: "Step-by-step explanations for every question to enhance understanding",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your improvement and stay motivated with clear metrics",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const quickStats = [
    { label: "Questions Available", value: "5,000+", icon: CheckCircle },
  ];

  const StepCard = ({ step, index }) => {
    return (
      <div className="group relative">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
              {step.number}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{step.description}</p>
              <ul className="space-y-2">
                {step.actions.map((action, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
      </div>
    );
  };

  const FeatureCard = ({ feature }) => {
    const IconComponent = feature.icon;
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-3">
          <IconComponent className={`w-6 h-6 ${feature.color} mr-3`} />
          <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
        </div>
        <p className="text-sm text-gray-600">{feature.description}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-3xl mb-6">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your Success Journey
            </h1>
            <p className=" text-primary-100 mb-6 max-w-3xl mx-auto">
              Begin your JEE & NEET preparation with RankMarg's personalized practice sessions. 
              Follow our step-by-step guide to improve your performance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {quickStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-primary-200" />
                    <div>
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-sm text-primary-200">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

     

      {/* Steps */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4 Simple Steps to Success</h2>
            <p className=" text-gray-600">Follow our methodology to improve your performance</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Choose RankMarg?</h2>
            <p className="text-lg text-gray-600">Key features designed for your success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-3xl mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Begin?</h2>
          <p className=" text-primary-100 mb-6">
            Join the new generation of students preparing with RankMarg's personalized approach
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center">
              <Play className="w-4 h-4 mr-2" />
              Start Free Practice
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Platform
            </button>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Getting Started?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Our team is here to guide you through the setup process and answer any questions you might have.
                </p>
                <a 
                  href="mailto:support@rankmarg.in?subject=Get Started - Need Help"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="py-8 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              <strong>Pro Tip:</strong> Start with your strongest subject to build confidence, then gradually tackle challenging topics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;