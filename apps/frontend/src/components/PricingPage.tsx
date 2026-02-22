"use client"
import React from 'react';
import { Check, X, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

const SaasPricing = () => {

  const router = useRouter();
  const searchParams = useSearchParams();
  const via = searchParams.get('via') || '';
  const token = searchParams.get('token') || '';

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

  const detailedComparison = [
    { feature: "Common Mistake Student Do Section", free: false, paid: true },
    { feature: "Strategy Section", free: false, paid: true },
    { feature: "Step By step Solution", free: true, paid: true },
    { feature: "Adaptive Question Sets", free: false, paid: true },
    { feature: "Practice Session", free: "5 Q/Session", paid: "Adaptive" },
    { feature: "Analytics", free: "Limited", paid: "Full" },
    { feature: "Mock Test", free: "2/Month", paid: "Unlimited" },
    { feature: "Mistake Tracker", free: true, paid: true },
    { feature: "Mastery", free: false, paid: true },
    { feature: "Section Wise", free: "Limited", paid: "Unlimited" },
  ];



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

        {/* Detailed Comparison (replaces old Feature Comparison) */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-primary-600 to-primary-600 text-white px-4 md:px-6 py-4">
            <h2 className="text-lg md:text-xl font-bold">Feature Comparison</h2>
            <p className="text-purple-100 text-sm">Free vs Paid at a glance</p>
          </div>

          {/* Desktop/tablet table */}
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left text-sm font-semibold text-gray-700 px-6 py-3 w-2/4">Feature</th>
                    <th className="text-center text-sm font-semibold text-gray-700 px-6 py-3 w-1/4">Free</th>
                    <th className="text-center text-sm font-semibold text-gray-700 px-6 py-3 w-1/4">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedComparison.map((row) => (
                    <tr key={row.feature} className="border-b last:border-b-0">
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900 leading-snug">{row.feature}</div>
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        {row.free === true ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        ) : row.free === false ? (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <X className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : (
                          <span className="inline-block text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        {row.paid === true ? (
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-4 h-4 text-primary-600" />
                          </div>
                        ) : row.paid === false ? (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <X className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : (
                          <span className="inline-block text-xs font-bold text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
                            {row.paid}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile stacked list */}
          <div className="md:hidden divide-y">
            {detailedComparison.map((row) => (
              <div key={row.feature} className="px-4 py-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">{row.feature}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 border">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Free</div>
                    {row.free === true ? (
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    ) : row.free === false ? (
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-gray-800">{row.free}</div>
                    )}
                  </div>
                  <div className="bg-primary-50 rounded-lg p-2 border border-primary-100">
                    <div className="text-[11px] uppercase tracking-wide text-primary-700 mb-1">Paid</div>
                    {row.paid === true ? (
                      <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-600" />
                      </div>
                    ) : row.paid === false ? (
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-primary-800">{row.paid}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 md:p-6 bg-gradient-to-r from-primary-100 to-primary-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm text-gray-600 mb-1">Starting from</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹1,499<span className="text-sm font-normal text-gray-500">/year</span>
              </div>
            </div>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-6 md:px-8 py-3 rounded-xl shadow-lg text-base md:text-lg hover:scale-105 transition-transform duration-200"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('plan', 'rank');
                params.set('ref', 'pricing_page');
                if (via) params.set('via', via);
                if (token) params.set('token', token);
                router.push(`/subscription?${params.toString()}`);
              }}
            >
              Enroll Now
            </button>
          </div>
        </div>



        {/* Trust Indicators */}
        <div className="mt-8 md:mt-12 hidden">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200">
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

    </div>
  );
};



export default SaasPricing;