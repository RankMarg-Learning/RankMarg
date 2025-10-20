import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Brain, Flame, Target as TargetIcon, BookOpen } from 'lucide-react-native';
import tw from '@/utils/tailwind';
import { SmartStudyHubProps, SubjectGroup } from '@/src/types/dashboard.types';

function formatSecondsToMinSec(seconds: number) {
  const mins = Math.floor((seconds || 0) / 60);
  const secs = Math.max(0, (seconds || 0) % 60);
  return `${mins}m ${secs}s`;
}

const StatBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <View style={tw`flex-row items-center gap-1 px-2 py-1 rounded-md bg-primary-100`}> 
    <Icon size={14} color={tw.color('primary-700') || '#0ea5e9'} />
    <Text style={tw`text-primary-700 text-xs font-medium`}>{label}</Text>
  </View>
);

const ProgressBar = ({ value }: { value: number }) => (
  <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
    <View style={[tw`h-2 bg-primary-400`, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
  </View>
);

const RevisionSubtopicsCard = ({ revisionData, onViewAll }: { revisionData: any; onViewAll: () => void }) => {
  const subtopics: string[] = revisionData?.display || [];
  const groupedData = revisionData?.grouped || [];
  return (
    <TouchableOpacity onPress={onViewAll} activeOpacity={0.8}>
      <View style={tw`border border-purple-100 rounded-xl p-4 bg-white`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-purple-800 text-sm font-medium`}>Today's Top Concepts</Text>
          {groupedData.length > 0 && (
            <Text style={tw`text-purple-600 text-xs`}>View All</Text>
          )}
        </View>
        <View style={tw`flex-row flex-wrap gap-1`}>
          {subtopics.length > 0 ? (
            subtopics.map((name, i) => (
              <View key={`subtopic-${i}`} style={tw`px-2 py-1 rounded-md bg-purple-50 border border-purple-100`}>
                <Text style={tw`text-purple-700 text-xs`}>{name}</Text>
              </View>
            ))
          ) : (
            <View style={tw`items-center justify-center py-3 w-full`}>
              <Text style={tw`text-gray-700 text-sm`}>No subtopics to study today.</Text>
              <Text style={tw`text-gray-500 text-xs mt-1`}>No practice session found, so no study topics available.</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RevisionSubtopicsModal = ({ visible, onClose, groupedData }: { visible: boolean; onClose: () => void; groupedData: any[] }) => {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const reorganizedData = useMemo((): SubjectGroup[] => {
    if (!groupedData || groupedData.length === 0) return [];
    const subjectGroups = new Map<string, { subjectId: string; subjectName: string; totalCount: number; topics: Map<string, { topicId: string; topicName: string; count: number; subtopics: Map<string, { subtopicId: string; subtopicName: string; count: number; }>; }>; }>();
    groupedData.forEach((subject: any) => {
      if (!subjectGroups.has(subject.subjectId)) {
        subjectGroups.set(subject.subjectId, { subjectId: subject.subjectId, subjectName: subject.subjectName, totalCount: 0, topics: new Map() });
      }
      const subjectGroup = subjectGroups.get(subject.subjectId)!;
      subject.subtopics.forEach((subtopic: any) => {
        const topicKey = subtopic.topicId;
        if (!subjectGroup.topics.has(topicKey)) {
          subjectGroup.topics.set(topicKey, { topicId: subtopic.topicId, topicName: subtopic.topicName, count: 0, subtopics: new Map() });
        }
        const topicGroup = subjectGroup.topics.get(topicKey)!;
        topicGroup.count += subtopic.count;
        subjectGroup.totalCount += subtopic.count;
        if (!topicGroup.subtopics.has(subtopic.id)) {
          topicGroup.subtopics.set(subtopic.id, { subtopicId: subtopic.id, subtopicName: subtopic.name, count: subtopic.count });
        }
      });
    });
    return Array.from(subjectGroups.values())
      .map((subjectGroup) => ({
        subjectId: subjectGroup.subjectId,
        subjectName: subjectGroup.subjectName,
        totalCount: subjectGroup.totalCount,
        topics: Array.from(subjectGroup.topics.values())
          .map((topicGroup) => ({
            topicId: topicGroup.topicId,
            topicName: topicGroup.topicName,
            count: topicGroup.count,
            subtopics: Array.from(topicGroup.subtopics.values()).sort((a, b) => b.count - a.count),
          }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [groupedData]);

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={tw`flex-1 bg-white`}>
        <View style={tw`px-4 py-3 border-b border-gray-200 flex-row items-center gap-2`}>
          <BookOpen size={18} color={tw.color('gray-900') || '#111'} />
          <Text style={tw`text-base font-semibold text-gray-900`}>Study Topics</Text>
          <View style={tw`flex-1`} />
          <TouchableOpacity onPress={onClose}>
            <Text style={tw`text-blue-600 text-sm`}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={tw`p-3`}>
          {reorganizedData.length > 0 ? (
            reorganizedData.map((subjectGroup) => {
              const isActive = activeSubject === subjectGroup.subjectId;
              return (
                <View key={`subject-${subjectGroup.subjectId}`} style={tw`mb-3`}>
                  <TouchableOpacity onPress={() => setActiveSubject(isActive ? null : subjectGroup.subjectId)} activeOpacity={0.8}>
                    <View style={[tw`rounded-lg border p-3`, isActive ? tw`border-purple-300 bg-purple-50` : tw`border-gray-200 bg-white`]}>
                      <Text style={[tw`text-sm font-semibold`, isActive ? tw`text-purple-900` : tw`text-gray-900`]} numberOfLines={1}>
                        {subjectGroup.subjectName}
                      </Text>
                      <Text style={tw`text-xs text-gray-600`}>{subjectGroup.topics.length} topics • {subjectGroup.totalCount} questions</Text>
                    </View>
                  </TouchableOpacity>
                  {isActive && (
                    <View style={tw`border border-purple-100 rounded-b-lg bg-white mt-1`}>
                      <View style={tw`p-3 gap-2`}>
                        {subjectGroup.topics.map((topicGroup) => (
                          <View key={`topic-${topicGroup.topicId}`} style={tw`rounded-lg border border-blue-100 p-3 bg-white`}>
                            <View style={tw`flex-row items-center justify-between mb-2`}>
                              <Text style={tw`text-xs font-semibold text-gray-800`} numberOfLines={1}>{topicGroup.topicName}</Text>
                              <View style={tw`px-2 py-0.5 rounded bg-blue-100`}>
                                <Text style={tw`text-blue-800 text-xs`}>{topicGroup.subtopics.length} subtopics</Text>
                              </View>
                            </View>
                            <View style={tw`flex-row flex-wrap gap-1 max-h-20`}>
                              {topicGroup.subtopics.map((subtopicGroup) => (
                                <View key={`subtopic-${subtopicGroup.subtopicId}`} style={tw`px-2 py-0.5 rounded-md bg-green-50 border border-green-200`}>
                                  <Text style={tw`text-green-700 text-xs`} numberOfLines={1}>{subtopicGroup.subtopicName}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={tw`items-center py-10`}>
              <BookOpen size={64} color={tw.color('gray-400') || '#9ca3af'} />
              <Text style={tw`text-lg font-medium text-gray-700 mt-3`}>No study topics available</Text>
              <Text style={tw`text-sm text-gray-500 mt-1`}>Complete practice sessions to see your study topics.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export function SmartStudyHub({ dashboardData, currentStudies }: SmartStudyHubProps) {
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const userStats = useMemo(() => ({
    streak: dashboardData?.userStats?.streak ?? 0,
    level: dashboardData?.userStats?.level ?? 1,
  }), [dashboardData?.userStats]);

  const todaysProgress = useMemo(() => ({
    percentComplete: dashboardData?.todaysProgress?.percentComplete ?? 0,
    minutesStudied: dashboardData?.todaysProgress?.minutesStudied ?? 0,
    goalMinutes: dashboardData?.todaysProgress?.goalMinutes ?? 0,
  }), [dashboardData?.todaysProgress]);

  const groupedRevisionData = useMemo(() => dashboardData?.revisionSubtopics?.grouped || [], [dashboardData?.revisionSubtopics]);

  return (
    <View style={tw`rounded-xl overflow-hidden bg-primary-50 border border-primary-100 mb-4`}>
      <View style={tw`p-4 gap-4`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View>
            <View style={tw`flex-row items-center gap-2`}>
              <Brain size={18} color={tw.color('primary-600') || '#0284c7'} />
              <Text style={tw`text-primary-900 text-lg font-semibold`}>Smart Study Hub</Text>
            </View>
            <Text style={tw`text-muted-foreground text-sm`}>Personalized learning path based on your performance</Text>
          </View>
          <View style={tw`flex-row items-center gap-2`}>
            <StatBadge icon={Flame} label={`${userStats.streak} day streak`} />
            <StatBadge icon={TargetIcon} label={`Level ${userStats.level}`} />
          </View>
        </View>

        <View style={tw`gap-3`}>
          <View style={tw`border border-primary-100 rounded-xl p-4 bg-white`}>
            <Text style={tw`text-primary-800 text-sm font-medium mb-2`}>Today's Progress</Text>
            <ProgressBar value={todaysProgress.percentComplete} />
            <View style={tw`flex-row items-center justify-between mt-2`}>
              <Text style={tw`text-sm`}>{formatSecondsToMinSec(todaysProgress.minutesStudied)}</Text>
              <Text style={tw`text-sm text-gray-500`}>Goal: {formatSecondsToMinSec(todaysProgress.goalMinutes)}</Text>
            </View>
          </View>

          <RevisionSubtopicsCard revisionData={dashboardData?.revisionSubtopics} onViewAll={() => setRevisionModalOpen(true)} />

          {/* Current topics summary */}
          <View style={tw`border border-green-100 rounded-xl p-4 bg-white`}>
            <Text style={tw`text-green-800 text-sm font-medium mb-2`}>Current Topics</Text>
            {Array.isArray(currentStudies) && currentStudies.length > 0 ? (
              currentStudies.slice(0, 3).map((t) => (
                <View key={t.id} style={tw`flex-row items-center justify-between py-1`}>
                  <Text style={tw`text-sm flex-1`} numberOfLines={1}>{t.topicName}</Text>
                  <View style={tw`px-2 py-0.5 rounded-md border bg-green-50 border-green-200 ml-2`}>
                    <Text style={tw`text-green-700 text-xs`}>{t.subjectName}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={tw`text-gray-600 text-sm`}>No current topics assigned.</Text>
            )}
          </View>
        </View>
      </View>

      <RevisionSubtopicsModal visible={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} groupedData={groupedRevisionData} />
    </View>
  );
}

export default SmartStudyHub;


