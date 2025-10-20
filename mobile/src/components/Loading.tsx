import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import tw from '@/utils/tailwind';

export default function Loading() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-50`}>
      <ActivityIndicator size="large" />
      <Text style={tw`mt-2 text-gray-600`}>Loading...</Text>
    </View>
  );
}


