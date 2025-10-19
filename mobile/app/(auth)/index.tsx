import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import tw from "@/utils/tailwind";

export default function AuthIndexScreen() {
  return (
    <View style={tw`flex-1 bg-gradient-to-b from-yellow-100 to-yellow-50`}>
      <View style={tw`flex-1 justify-center items-center px-6`}>
        {/* Logo/Brand Section */}
        <View style={tw`mb-12 items-center`}>
          <Text style={tw`text-4xl font-bold text-amber-600 mb-4`}>
            RankMarg
          </Text>
          <Text style={tw`text-lg text-gray-600 text-center`}>
            Your journey to success starts here
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={tw`w-full max-w-sm space-y-4`}>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            style={tw`bg-amber-500 rounded-lg py-4 px-6 shadow-sm`}
          >
            <Text style={tw`text-white text-center font-semibold text-lg`}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            style={tw`border border-amber-500 rounded-lg py-4 px-6 bg-white shadow-sm`}
          >
            <Text style={tw`text-amber-600 text-center font-semibold text-lg`}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={tw`mt-12`}>
          <Text style={tw`text-xs text-center text-gray-500`}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}
