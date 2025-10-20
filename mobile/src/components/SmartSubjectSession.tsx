import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { ArrowRight, Clock, History, RotateCcw, Star } from 'lucide-react-native';
import tw from '@/utils/tailwind';
import { PracticeSession } from '@/src/types/dashboard.types';
import { router } from 'expo-router';

function formatSecondsToMinSec(seconds: number) {
  const mins = Math.floor((seconds || 0) / 60);
  const secs = Math.max(0, (seconds || 0) % 60);
  return `${mins}m ${secs}s`;
}

function SessionCard({ practice }: { practice: PracticeSession }) {
  const progressPercentage = Math.round((practice.questionsAttempted / Math.max(1, practice.totalQuestions)) * 100);
  const formattedLastAttempt = practice.lastAttempt ? new Date(practice.lastAttempt).toLocaleString() : 'Not yet attempted';
  const difficultyMap: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const difficultyLabel = difficultyMap[practice.difficultyLevel] || 'Unknown';

  return (
    <View style={tw`w-[320px] mr-3 bg-white rounded-xl p-4 border`}> 
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <View>
          <Text style={tw`text-lg font-medium`}>{practice.title} Practice</Text>
          <Text style={tw`text-sm text-gray-600`}>Adaptive Question Session</Text>
        </View>
        <View style={tw`px-2 py-1 rounded bg-gray-100`}>
          <Text style={tw`text-xs text-gray-800`}>{practice.totalQuestions} Questions</Text>
        </View>
      </View>

      <View style={tw`gap-3`}>
        <View>
          <View style={tw`flex-row justify-between mb-1`}>
            <Text style={tw`text-sm`}>Progress</Text>
            <Text style={tw`text-sm`}>{progressPercentage}%</Text>
          </View>
          <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
            <View style={[tw`h-2 bg-primary-500`, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={tw`flex-row gap-2`}>
          <View style={tw`flex-1 bg-white rounded-lg border p-3`}>
            <Text style={tw`text-sm text-gray-600`}>Time Required</Text>
            <View style={tw`flex-row items-center gap-1`}>
              <Clock size={16} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-sm`}>{formatSecondsToMinSec(Number(practice.timeRequired))}</Text>
            </View>
          </View>
          <View style={tw`flex-1 bg-white rounded-lg border p-3`}>
            <Text style={tw`text-sm text-gray-600`}>Last Active</Text>
            <View style={tw`flex-row items-center gap-1`}>
              <History size={16} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-sm`} numberOfLines={1}>{formattedLastAttempt}</Text>
            </View>
          </View>
          <View style={tw`flex-1 bg-white rounded-lg border p-3`}>
            <Text style={tw`text-sm text-gray-600`}>Difficulty</Text>
            <Text style={tw`text-sm`}>{difficultyLabel}</Text>
          </View>
        </View>

        <View>
          <Text style={tw`text-sm font-medium mb-2`}>Key Topics:</Text>
          <View style={tw`flex-row flex-wrap gap-1`}>
            {practice.keySubtopics.map((subtopic, i) => (
              <View key={i} style={tw`px-2 py-1 rounded bg-gray-100`}>
                <Text style={tw`text-xs text-gray-800`}>{subtopic}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={tw`flex-row gap-2 pt-2`}>
          <TouchableOpacity
            onPress={() => router.push(`/ai-session/${practice.id}`)}
            style={tw`flex-row items-center gap-1 border px-3 py-2 rounded-lg`}
          >
            {!practice.lastAttempt ? (
              <RotateCcw size={16} color={tw.color('gray-900') || '#111827'} />
            ) : (
              <History size={16} color={tw.color('gray-900') || '#111827'} />
            )}
            <Text style={tw`text-sm`}>{!practice.lastAttempt ? 'Start Session' : 'Resume Session'}</Text>
            <ArrowRight size={16} color={tw.color('gray-900') || '#111827'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SmartSubjectSession({ session }: { session: PracticeSession[] }) {
  const totalSlides = session?.length || 0;
  const data = useMemo(() => session || [], [session]);

  if (!session || session.length === 0) {
    return (
      <View style={tw`p-4 border rounded-md bg-white`}>
        <Text style={tw`text-center text-gray-600`}>No practice sessions available</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={tw`flex-row items-center mb-3`}>
        <Star size={20} color={tw.color('amber-500') || '#f59e0b'} />
        <Text style={tw`text-lg font-semibold ml-2`}>Daily Subject Practice Sessions</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <SessionCard practice={item} />}
        contentContainerStyle={tw`pl-1 pr-4`}
        pagingEnabled={false}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}


