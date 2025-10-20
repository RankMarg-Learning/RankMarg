import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '@/utils/tailwind';
import { router } from 'expo-router';
import { BookOpen, Brain, ListChecks, XCircle, ChartBar, RotateCcw, Target, GraduationCap, History, Award } from 'lucide-react-native';

const navItems = [
  { icon: BookOpen, label: 'Start Studying', description: 'Begin your daily session', href: '/ai-practice', color: 'blue', priority: 1, comingSoon: false },
  { icon: Brain, label: 'AI Tutor', description: 'Get personalized help', href: '/ai-practice', color: 'purple', priority: 8, comingSoon: true },
  { icon: ListChecks, label: 'By Subject', description: 'Practice specific topics', href: '/practice', color: 'amber', priority: 5, comingSoon: true },
  { icon: XCircle, label: 'Fix Mistakes', description: 'Review & correct errors', href: '/mistakes-tracker', color: 'red', priority: 4, comingSoon: false },
  { icon: ChartBar, label: 'My Progress', description: 'Track performance', href: '/analytics', color: 'green', priority: 3, comingSoon: false },
  { icon: RotateCcw, label: 'Review', description: 'Spaced repetition', href: '/review', color: 'cyan', priority: 6, comingSoon: true },
  { icon: Target, label: 'Goals', description: 'Set & track targets', href: '/goals', color: 'indigo', priority: 7, comingSoon: true },
  { icon: GraduationCap, label: 'Mastery', description: 'Subject proficiency', href: '/mastery', color: 'amber', priority: 2, comingSoon: false },
  { icon: History, label: 'History', description: 'Past practice sessions', href: '/history', color: 'gray', priority: 9, comingSoon: true },
  { icon: Award, label: 'Achievements', description: 'Badges & rewards', href: '/achievements', color: 'green', priority: 10, comingSoon: true },
];

function colorClasses(color: string) {
  switch (color) {
    case 'blue': return 'bg-blue-50 border-blue-100';
    case 'green': return 'bg-emerald-50 border-emerald-100';
    case 'red': return 'bg-red-50 border-red-100';
    case 'amber': return 'bg-amber-50 border-amber-100';
    case 'purple': return 'bg-purple-50 border-purple-100';
    case 'indigo': return 'bg-indigo-50 border-indigo-100';
    case 'cyan': return 'bg-cyan-50 border-cyan-100';
    case 'gray': return 'bg-slate-50 border-slate-100';
    default: return 'bg-slate-50 border-slate-100';
  }
}

export function QuickNavigation() {
  const displayItems = navItems.sort((a, b) => a.priority - b.priority).slice(0, 8);
  return (
    <View>
      <Text style={tw`text-base font-semibold mb-3`}>Quick Access</Text>
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {displayItems.map((item, index) => (
          <View key={index} style={tw`w-1/4 p-1`}>
            <TouchableOpacity
              onPress={() => { if (!item.comingSoon) router.push(item.href as any); }}
              activeOpacity={item.comingSoon ? 1 : 0.8}
            >
              <View style={tw.style(`items-center justify-center p-3 rounded-lg border ${colorClasses(item.color)}`, item.comingSoon && 'opacity-70')}>
                <item.icon size={20} color={tw.color('gray-800') || '#1f2937'} />
                <Text style={tw`text-xs font-medium mt-1 text-center`} numberOfLines={2}>{item.label}</Text>
                {item.comingSoon && (
                  <Text style={tw`text-[10px] text-gray-600 mt-1`}>Coming Soon</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

export default QuickNavigation;


