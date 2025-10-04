"use client"
import React from 'react';
import { Card } from '../ui/card';
import { ClipboardList, Clock, TrendingUp, BarChart2, Activity, Target, Flame } from 'lucide-react';
import { SubjectBackgroundColor, SubjectIcons } from '@/constant/SubjectColorCode';
import { Progress } from '../ui/progress';


const subjectData = [
  { key: 'physics', name: 'Physics', percentage: 85, questionsAttempted: 320, accuracy: 88 },
  { key: 'chemistry', name: 'Chemistry', percentage: 78, questionsAttempted: 285, accuracy: 82 },
  { key: 'mathematics', name: 'Mathematics', percentage: 92, questionsAttempted: 410, accuracy: 91 },
  { key: 'biology', name: 'Biology', percentage: 96.67, questionsAttempted: 375, accuracy: 95 },
];

const weeklyActivity = [
  { day: 'Mon', questions: 45, active: true },
  { day: 'Tue', questions: 38, active: true },
  { day: 'Wed', questions: 52, active: true },
  { day: 'Thu', questions: 41, active: true },
  { day: 'Fri', questions: 48, active: true },
  { day: 'Sat', questions: 35, active: true },
  { day: 'Sun', questions: 29, active: true },
];

const AnalyticsSection = () => {
  const maxQuestions = Math.max(...weeklyActivity.map(d => d.questions));

  return (
    <section className="py-20 px-4 bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-yellow-100 px-4 py-2 rounded-full mb-4">
            <BarChart2 className="w-4 h-4 text-primary-700" />
            <span className="text-sm font-semibold text-primary-700">Data-Driven Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Track Every Aspect of Your
            <span className="block text-primary-700">Preparation Journey</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive analytics that help you identify strengths, overcome weaknesses, and stay motivated throughout your NEET/JEE preparation.
          </p>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Performance Overview - Takes 2 columns on large screens */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-white to-primary-50 p-8 shadow-lg border border-primary-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Subject Mastery Progress
              </h3>
              <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>+12% this week</span>
              </div>
            </div>
            <div className="space-y-3">
              {subjectData.map(({ key, name, percentage, questionsAttempted, accuracy }) => {
                const Icon = SubjectIcons[key] ?? SubjectIcons.default;
                const textBgColor = SubjectBackgroundColor[key] ?? SubjectBackgroundColor.default;
                return (
                  <div key={key} className="space-y-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${textBgColor.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`w-5 h-5 text-white`} />
                        </div>
                        <div>
                          <span className="text-gray-900 font-bold text-base">{name}</span>
                          <div className="text-xs text-gray-500">{questionsAttempted} questions attempted</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{percentage}%</div>
                        <div className="text-xs text-gray-500">Mastery</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs text-gray-600">
                        <span>Progress</span>
                        <span className="font-semibold">{accuracy}% accuracy</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <Progress
                          value={percentage}
                          className="h-full rounded-full transition-all duration-500"
                          indicatorColor={textBgColor} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Weekly Activity Heatmap */}
          <Card className="bg-gradient-to-br from-white to-orange-50 p-8 shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Weekly Streak</h3>
                <p className="text-xs text-gray-600">7-day activity</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {weeklyActivity.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-8">{day.day}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(day.questions / maxQuestions) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{day.questions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">288</div>
                <div className="text-xs text-gray-600">Questions this week</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
            title="Mock Tests"
            value="24"
            subtitle="Completed this month"
            bgColor="bg-blue-50"
            iconBg="bg-blue-100"
            valueColor="text-blue-600"
          />
          <MetricCard
            icon={<Target className="w-6 h-6 text-green-600" />}
            title="Accuracy Rate"
            value="87.5%"
            subtitle="+5.2% from last week"
            bgColor="bg-green-50"
            iconBg="bg-green-100"
            valueColor="text-green-600"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            title="Avg. Time/Question"
            value="1.2m"
            subtitle="Target: 1.5m ✓"
            bgColor="bg-purple-50"
            iconBg="bg-purple-100"
            valueColor="text-purple-600"
          />
          <MetricCard
            icon={<Activity className="w-6 h-6 text-pink-600" />}
            title="Study Streak"
            value="28 days"
            subtitle="Keep it going! 🔥"
            bgColor="bg-pink-50"
            iconBg="bg-pink-100"
            valueColor="text-pink-600"
          />
        </div>

        
      </div>
    </section>
  );
};

export default AnalyticsSection;

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  bgColor,
  iconBg,
  valueColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  bgColor: string;
  iconBg: string;
  valueColor: string;
}) => {
  return (
    <Card className={`${bgColor} p-6 shadow-md border-2 border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={` ${iconBg} rounded-lg`}>{icon}</div>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-extrabold ${valueColor}`}>{value}</div>
        <div className="text-xs text-gray-700">{subtitle}</div>
      </div>
    </Card>
  );
};
