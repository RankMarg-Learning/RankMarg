import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import tw from '@/utils/tailwind';
import { useAuthContext } from '@/src/context/AuthContext';

export default function OnboardingScreen() {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to RankMarg! 🎉",
      description: "We're excited to have you on board. Let's get you started with a quick tour of the app.",
      icon: "👋",
    },
    {
      title: "Your Learning Journey",
      description: "Track your progress, take practice tests, and improve your skills with our comprehensive platform.",
      icon: "📚",
    },
    {
      title: "Personalized Experience",
      description: "Get customized recommendations and insights based on your performance and goals.",
      icon: "🎯",
    },
    {
      title: "Ready to Start?",
      description: "You're all set! Let's begin your journey to success.",
      icon: "🚀",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and go to dashboard
      router.replace('/dashboard');
    }
  };

  const handleSkip = () => {
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gradient-to-b from-yellow-100 to-yellow-50`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`flex-grow`}>
        <View style={tw`flex-1 justify-center items-center px-6`}>
          {/* Progress Indicator */}
          <View style={tw`flex-row mb-8`}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={tw`h-2 w-8 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>

          {/* Content */}
          <View style={tw`items-center mb-8`}>
            <Text style={tw`text-6xl mb-6`}>{steps[currentStep].icon}</Text>
            <Text style={tw`text-3xl font-bold text-gray-900 text-center mb-4`}>
              {steps[currentStep].title}
            </Text>
            <Text style={tw`text-lg text-gray-600 text-center leading-relaxed`}>
              {steps[currentStep].description}
            </Text>
          </View>

          {/* User Welcome */}
          {currentStep === 0 && user && (
            <View style={tw`bg-white rounded-xl p-6 mb-8 shadow-sm`}>
              <Text style={tw`text-center text-gray-700`}>
                Hello, <Text style={tw`font-semibold text-amber-600`}>{user.username}</Text>!
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={tw`w-full max-w-sm space-y-4`}>
            <TouchableOpacity
              onPress={handleNext}
              style={tw`bg-amber-500 rounded-lg py-4 px-6 shadow-sm`}
            >
              <Text style={tw`text-white text-center font-semibold text-lg`}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>

            {currentStep < steps.length - 1 && (
              <TouchableOpacity
                onPress={handleSkip}
                style={tw`border border-amber-500 rounded-lg py-4 px-6 bg-white shadow-sm`}
              >
                <Text style={tw`text-amber-600 text-center font-semibold text-lg`}>
                  Skip Tour
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={tw`mt-8`}>
            <Text style={tw`text-xs text-center text-gray-500`}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
