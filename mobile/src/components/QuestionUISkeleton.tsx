import React from 'react';
import { View } from 'react-native';
import tw from '@/utils/tailwind';

function Block({ h, w }: { h: number; w: string }) {
  return <View style={tw`bg-gray-200 rounded`} style={{ height: h, width: w }} />;
}

export default function QuestionUISkeleton() {
  return (
    <View style={tw`flex-1 bg-gray-100`}>
      <View style={tw`flex-1 p-4`}>
        {/* Left side: Question */}
        <View style={tw`w-full border-b border-gray-200 pb-4 mb-4`}>
          <Block h={32} w={'40%'} />
          <View style={tw`flex-row justify-between items-center mt-3`}>
            <Block h={24} w={'20%'} />
            <View style={tw`flex-row items-center`}> 
              <Block h={24} w={'30%'} />
            </View>
          </View>
          <View style={tw`mt-3`}>
            <Block h={200} w={'100%'} />
          </View>
        </View>

        {/* Right side: Options */}
        <View style={tw`w-full`}>
          <Block h={40} w={'30%'} />
          <View style={tw`mt-3`}>
            <Block h={40} w={'100%'} />
            <View style={tw`h-2`} />
            <Block h={40} w={'100%'} />
            <View style={tw`h-2`} />
            <Block h={40} w={'100%'} />
            <View style={tw`h-2`} />
            <Block h={40} w={'100%'} />
          </View>
          <View style={tw`mt-4`}>
            <Block h={40} w={'20%'} />
          </View>
        </View>
      </View>
    </View>
  );
}


