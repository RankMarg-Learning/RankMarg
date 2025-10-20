import React from 'react';
import { View } from 'react-native';
import tw from '@/utils/tailwind';

export function Progress({ value = 0 }: { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={tw`h-2 bg-gray-100 rounded`}> 
      <View style={[tw`h-2 bg-primary-500 rounded`, { width: `${clamped}%` }]} />
    </View>
  );
}

export default Progress;


