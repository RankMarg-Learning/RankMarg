"use client"
import React, { useState, useEffect } from 'react';
import { Check, Star, Zap,  ArrowRight, Sparkles, Users, TrendingUp, Shield } from 'lucide-react';

const PricingPage = () => {
  const [is2Year, setIs2Year] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const plan = {
    name: "ACHIEVER",
    description: "Complete solution for serious students",
    originalOneYear: 2499,
    originalTwoYear: 4499,
    oneYearPrice: 1999,
    twoYearPrice: 2999,
    oneYearDiscount: 20,
    twoYearDiscount: 33,
    color: "from-yellow-500 to-amber-500",
    features: [
      "Personalized Practice Sessions",
      "Topic & Sub-topic Mastery Tracker",
      "Full‑Length Mock Tests",
      "Subject‑wise & Topic‑wise Tests",
      "Basic Suggestion Engine (What to practice today)",
      "Performance Analytics Dashboard (Progress, Accuracy, Speed)",
      "In‑depth Mistake Analysis (Identify misconceptions and gaps)"
    ],
    icon: Zap,
    trial: "14‑Day Free Trial — No Credit Card Needed"
  };

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student",
      content: "RankMarg helped me crack JEE Advanced! The practice tests were incredibly similar to the actual exam.",
      rating: 5
    },
    {
      name: "Arjun Patel", 
      role: "Medical Student",
      content: "The mentorship program is amazing. My mentor guided me through NEET preparation perfectly.",
      rating: 5
    },
    {
      name: "Sneha Reddy",
      role: "MBA Aspirant", 
      content: "Got into my dream B-school thanks to RankMarg's comprehensive CAT preparation course.",
      rating: 5
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Active Students" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" },
    { icon: Shield, value: "100%", label: "Satisfaction" }
  ];

  const price = is2Year ? plan.twoYearPrice : plan.oneYearPrice;
  const originalPrice = is2Year ? plan.originalTwoYear : plan.originalOneYear;
  const discount = is2Year ? plan.twoYearDiscount : plan.oneYearDiscount;
  const yearlyEquivalent = is2Year ? Math.round(plan.twoYearPrice / 2) : plan.oneYearPrice;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-yellow-300/15 to-amber-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-orange-300/15 to-yellow-300/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/10 to-orange-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-yellow-200/30 mb-8">
              <Sparkles className="w-5 h-5 mr-3 text-yellow-600" />
              <span className="text-sm font-medium bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">
                🔥 Limited Time Offer - Up to 33% OFF!
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                Unlock Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                Academic Potential
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join thousands of students who've achieved their dreams with RankMarg's comprehensive learning platform. 
              From JEE to NEET, CAT to GATE - we've got you covered.
            </p>

            {/* Stats Section */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full mb-2 mx-auto">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Toggle */}
            <div className="flex items-center justify-center mb-16">
              <span className={`mr-4 text-base font-medium transition-colors duration-300 ${!is2Year ? 'text-gray-900' : 'text-gray-500'}`}>
                1 Year Plan
              </span>
              <button
                onClick={() => setIs2Year(!is2Year)}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                    is2Year ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-4 text-base font-medium transition-colors duration-300 ${is2Year ? 'text-gray-900' : 'text-gray-500'}`}>
                2 Year Plan
                <span className="ml-2 px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white">
                  Best Value
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative">
          {/* Most Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Most Popular
            </div>
          </div>

          {/* Discount Badge */}
          <div className="absolute -top-2 -right-2 z-30">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2 rounded-full text-xs font-bold transform rotate-12 shadow-lg">
              {discount}% OFF
            </div>
          </div>
          
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-300 shadow-xl shadow-yellow-500/10">
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${plan.color} mr-3`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    SAVE {discount}%
                  </span>
                </div>
                <div className="flex items-baseline mb-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">/{is2Year ? '2 years' : 'year'}</span>
                </div>
                {is2Year && (
                  <p className="text-green-600 text-sm font-medium mb-3">
                    Only ₹{yearlyEquivalent}/year • Save ₹{(plan.oneYearPrice * 2) - plan.twoYearPrice}
                  </p>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-blue-800 font-medium text-center text-sm">
                    🎁 {plan.trial}
                  </p>
                </div>
              </div>
              
              <button className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 mb-5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-lg shadow-yellow-500/25">
                <span className="flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </button>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Everything included:</h4>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mr-2 mt-0.5`}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
          Success Stories from Our Students
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 bg-white/40 backdrop-blur-xl border-t border-yellow-200/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Join over 50,000+ students who are already achieving their dreams with RankMarg
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/40">
              <span className="flex items-center justify-center">
                🎯 Start 14-Day Free Trial
                <Sparkles className="w-5 h-5 ml-2" />
              </span>
            </button>
            <button className="px-8 py-4 bg-white/60 hover:bg-white/80 text-gray-900 font-semibold rounded-2xl transition-all duration-300 border border-white/40 hover:border-yellow-300 hover:shadow-lg">
              Schedule Free Demo
            </button>
          </div>
          <p className="text-sm text-gray-600">
            ⏰ Offer valid until June 30th, 2025 • No Credit Card Required • 7-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;