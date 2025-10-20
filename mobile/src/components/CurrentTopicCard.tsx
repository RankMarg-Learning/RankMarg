import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '@/utils/tailwind';
import { CurrentStudies } from '@/src/types/dashboard.types';
import { router } from 'expo-router';

export default function CurrentTopicCard({ currentStudies }: { currentStudies: CurrentStudies[] }) {
  const grouped = useMemo(() => {
    const acc: Record<string, { topics: CurrentStudies[]; totalCount: number }> = {};
    (currentStudies || []).forEach((topic) => {
      if (!acc[topic.subjectName]) {
        acc[topic.subjectName] = { topics: [], totalCount: 0 };
      }
      acc[topic.subjectName].topics.push(topic);
      acc[topic.subjectName].totalCount += 1;
    });
    Object.values(acc).forEach((group) => {
      group.topics.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    });
    return acc;
  }, [currentStudies]);

  return (
    <View style={tw`border border-green-100 bg-white rounded-xl p-4`}>
      <View style={tw`flex-row items-center justify-between mb-2`}>
        <Text style={tw`text-green-800 text-sm font-medium`}>Current Topics</Text>
        <TouchableOpacity onPress={() => router.push('/my-curriculum')}>
          <Text style={tw`text-green-700 text-xs`}>Manage</Text>
        </TouchableOpacity>
      </View>

      {Object.keys(grouped).length > 0 ? (
        <View style={tw`gap-2`}>
          {Object.entries(grouped).map(([subjectName, { topics, totalCount }]) => {
            const firstTopic = topics[0];
            const hasMore = totalCount > 1;
            return (
              <View key={subjectName} style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1 pr-2`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    <Text numberOfLines={1} style={tw`text-sm font-medium flex-1`}>
                      {firstTopic.topicName}
                    </Text>
                    {hasMore && (
                      <View style={tw`px-1.5 py-0.5 rounded bg-gray-100`}>
                        <Text style={tw`text-xs text-gray-700`}>+{totalCount - 1}</Text>
                      </View>
                    )}
                    {firstTopic.isCompleted && (
                      <View style={tw`px-1.5 py-0.5 rounded bg-blue-100`}>
                        <Text style={tw`text-xs text-blue-700`}>Done</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={tw`px-2 py-1 rounded-md border bg-green-50 border-green-200 ml-2`}>
                  <Text style={tw`text-green-700 text-xs`}>{subjectName}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={tw`items-center py-3`}>
          <Text style={tw`text-sm font-medium text-gray-700`}>No current topics assigned.</Text>
          <Text style={tw`text-xs text-gray-500 mt-1 mb-2`}>Please update your current topic to start tracking your studies.</Text>
          <TouchableOpacity onPress={() => router.push('/my-curriculum')} style={tw`px-3 py-2 rounded-lg border`}>
            <Text style={tw`text-xs`}>Add Topic</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


