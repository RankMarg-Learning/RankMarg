import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import tw from '@/utils/tailwind';

interface SplashScreenProps {
  message?: string;
}

export function SplashScreen({ message = "Loading..." }: SplashScreenProps) {
  return (
    <View style={tw`flex-1 justify-center items-center bg-gradient-to-b from-yellow-100 to-yellow-50`}>
      <View style={tw`items-center`}>
        {/* Logo/Brand */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-4xl font-bold text-amber-600 mb-2`}>
            RankMarg
          </Text>
          <Text style={tw`text-lg text-gray-600 text-center`}>
            Your journey to success starts here
          </Text>
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={tw`text-gray-600 mt-4 text-lg`}>{message}</Text>
        <Text style={tw`text-gray-500 mt-2 text-sm text-center`}>
          Please wait while we set things up for you
        </Text>
      </View>
    </View>
  );
}

export default SplashScreen;
