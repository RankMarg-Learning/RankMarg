"use client"
import React, { useState } from 'react';
import {
  Target,
  Brain,
  FileText,
  BarChart2,
  LayoutDashboard,
  CircleX,
  Check,
  X,
  Sparkles
} from "lucide-react";
import PricingDialog from './PricingDialog';

const SaasPricing = () => {
  const [showDialog, setShowDialog] = useState(false);

   const features = [
    {
      name: "Dashboard",
      desc: "View your performance, daily tasks, and system suggestions at a glance.",
      free: true,
      rank: true,
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      name: "Smart Practice",
      desc: "Get AI-powered daily practice based on your performance, mastery, and topic progress.",
      free: "Limited",
      rank: "Unlimited",
      icon: <Target className="w-4 h-4" />
    },
    {
      name: "Mock Tests",
      desc: "Attempt NEET/JEE full-length tests with detailed analysis, rank, and percentile.",
      free: "Limited",
      rank: "Unlimited",
      icon: <FileText className="w-4 h-4" />
    },
    {
      name: "Mastery Tracking",
      desc: "Track concept-level mastery using Bayesian algorithms and weekly performance updates.",
      free: false,
      rank: true,
      icon: <Brain className="w-4 h-4" />
    },
    {
      name: "Mistakes Tracker",
      desc: "Automatically record incorrect attempts and revise weak areas with smart feedback.",
      free: false,
      rank: true,
      icon: <CircleX className="w-4 h-4" />
    },
    {
      name: "Analytics",
      desc: "View in-depth reports including topic-wise accuracy, speed, and consistency trends.",
      free: false,
      rank: true,
      icon: <BarChart2 className="w-4 h-4" />
    }
  ];

  const trustIndicators = [
    {
      icon: <Check className="w-5 h-5 text-green-600" />,
      title: "90-Day Guarantee*",
      subtitle: "Money-back promise",
      bgColor: "bg-green-100"
    },
    {
      icon: <span className="text-purple-600 font-bold text-sm">5K+</span>,
      title: "5,000+ Students",
      subtitle: "Trusted nationwide",
      bgColor: "bg-purple-100"
    },
    {
      icon: <span className="text-indigo-600 font-bold text-lg">⚡</span>,
      title: "Instant Access",
      subtitle: "Start immediately",
      bgColor: "bg-indigo-100"
    }
  ];

  const FeatureRow = ({ feature, index }) => (
    <div
      className={`flex items-start px-4 md:px-6 py-4 border-b last:border-b-0 ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            {feature.icon}
          </div>
          <h3 className="font-medium text-gray-900 text-sm leading-tight">{feature.name}</h3>
        </div>
        <p className="text-xs text-gray-600 ml-9 leading-relaxed">{feature.desc}</p>
      </div>
      <div className="w-20 md:w-24 flex items-center justify-center flex-shrink-0">
        {feature.free === true ? (
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
        ) : feature.free === false ? (
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-gray-400" />
          </div>
        ) : (
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
            {feature.free}
          </span>
        )}
      </div>
      <div className="w-24 md:w-32 flex items-center justify-center flex-shrink-0">
        {feature.rank === true ? (
          <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-600" />
          </div>
        ) : feature.rank === false ? (
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-gray-400" />
          </div>
        ) : (
          <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
            {feature.rank}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 mb-4">
            <Sparkles className="w-3 h-3 text-primary-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">Premium Plans</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Unlock the full potential of your NEET/JEE preparation with our comprehensive solution. 
            Compare features and choose the plan that fits your needs.
          </p>
        </header>

        {/* Feature Comparison Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-600 text-white px-4 md:px-6 py-4">
            <h2 className="text-lg md:text-xl font-bold mb-2">Feature Comparison</h2>
            <p className="text-purple-100 text-sm">See what's included in each plan</p>
          </div>
          
          <div className="flex items-center px-4 md:px-6 py-4 border-b bg-gray-50">
            <div className="flex-1" />
            <div className="w-20 md:w-24 text-center">
              <span className="text-sm font-bold text-gray-500">FREE</span>
            </div>
            <div className="w-24 md:w-32 text-center">
              <span className="bg-gradient-to-br from-primary-400 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                RANK
              </span>
            </div>
          </div>
          
          <div >
            {features.map((feature, index) => (
              <FeatureRow key={feature.name} feature={feature} index={index} />
            ))}
          </div>
          
          <div className="p-4 md:p-6 bg-gradient-to-r from-primary-100 to-primary-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm text-gray-600 mb-1">Starting from</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹1,999<span className="text-sm font-normal text-gray-500">/year</span>
              </div>
            </div>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-6 md:px-8 py-3 rounded-xl shadow-lg text-base md:text-lg hover:scale-105 transition-transform duration-200"
              onClick={() => setShowDialog(true)}
            >
              Enroll Now
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 md:mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className={`w-10 h-10 ${indicator.bgColor} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                    {indicator.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">{indicator.title}</div>
                    <div className="text-xs text-gray-600">{indicator.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      {showDialog && <PricingDialog onClose={() => setShowDialog(false)} />}
    </div>
  );
};



export default SaasPricing;