import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AiPracticeSession from '@/src/components/AiPracticeSession';
import tw from '@/utils/tailwind';

export default function AiSessionScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = params.sessionId as string;

  if (!sessionId) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <Text style={tw`text-red-600`}>Invalid session</Text>
      </View>
    );
  }

  return <AiPracticeSession sessionId={sessionId} />;
}


