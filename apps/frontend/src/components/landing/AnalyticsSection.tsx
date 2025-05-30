import React from 'react';
import { Card } from '../ui/card';
import { ClipboardList, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { SubjectBackgroundColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode';
import { Progress } from '../ui/progress';


const subjectData = [
  { key: 'physics', name: 'Physics', percentage: 85 },
  { key: 'chemistry', name: 'Chemistry', percentage: 78 },
  { key: 'mathematics', name: 'Mathematics', percentage: 92 },
  { key: 'biology', name: 'Biology', percentage: 96.67 },
];

const AnalyticsSection = () => {
  return (
    <section className=" py-16 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Student Performance Analytics</h2>
          <p className="text-gray-700 text-lg">
            Track your progress and understand your strengths and weaknesses
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Overview */}
          <Card className="bg-primary-100/40  p-6 shadow-sm border-yellow-400 ">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Performance Overview
            </h3>
            <div className="space-y-6">
              {subjectData.map(({ key, name, percentage }) => {
                const Icon = SubjectIcons[key] ?? SubjectIcons.default;
                const textColor = SubjectTextColor[key] ?? SubjectTextColor.default;
                const textBgColor = SubjectBackgroundColor[key] ?? SubjectBackgroundColor.default;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${textColor}`} />
                        <span className="text-gray-900 font-medium">{name}</span>
                      </div>
                      <span className="text-gray-800">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-[#FFF9EA] rounded-full overflow-hidden">
                      <Progress
                        value={percentage}
                        className=" h-full rounded-full transition-all duration-300"
                        indicatorColor={textBgColor} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Metrics Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <MetricCard
              icon={<ClipboardList className="w-5 h-5 text-[#F7B614]" />}
              title="Tests Score"
              value="248/300"
              subtitle="83.67% Score"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-[#F7B614]" />}
              title="Time Taken"
              value="2h 45m"
              subtitle="15 mins saved"
            />
            <MetricCard
              icon={<Clock className="w-5 h-5 text-[#F7B614]" />}
              title="Avg. Time per Question"
              value="1.8m"
              subtitle="Target: 1.5m"
            />
            <MetricCard
              icon={<BarChart2 className="w-5 h-5 text-[#F7B614]" />}
              title="Accuracy Rate"
              value="76%"
              subtitle="+2.4% from last week"
            />
          </div>
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
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) => {
  return (
    <Card className="bg-primary-100/40  p-6 shadow-sm border-primary-400">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-[#F7B614]/10 rounded-lg">{icon}</div>
        <h3 className=" font-medium text-gray-800">{title}</h3>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-700">{subtitle}</div>
      </div>
    </Card>
  );
};
