import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import tw from "@/utils/tailwind";
import MarkdownRenderer from "@/src/lib/MarkdownRenderer";
import ReadingDoc from "@/src/components/ReadDoc";

export default function AuthIndexScreen() {

  const content = `Given:  \n- Number of turns $$ N = 1000 $$\n- Radius $$ r = 10 \\, \\text{m} $$\n- Angular speed $$ \\omega = 2 \\, \\text{rad/s} $$\n- Magnetic field $$ B = 2 \\times 10^{-5} \\, \\text{T} $$\n- Resistance $$ R = 12.56 \\, \\Omega $$\n\n**Step 1**: Area of the circular coil:  \n$$\nA = \\pi r^2 = \\pi \\times 10^2 = 100\\pi \\, \\text{m}^2\n$$\n\n**Step 2**: Maximum induced emf:  \n$$\n\\varepsilon_{\\text{max}} = N B A \\omega  \n= 1000 \\times (2 \\times 10^{-5}) \\times (100\\pi) \\times 2 = 4\\pi \\, \\text{V}\n$$\n\n**Step 3**: Induced current:  \n$$\nI = \\frac{\\varepsilon_{\\text{max}}}{R} = \\frac{4\\pi}{12.56} \\approx 1 \\, \\text{A}\n$$`

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
        <View style={tw`w-full max-w-sm space-y-4 gap-4`}>
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
          <MarkdownRenderer content={content} style={tw`text-center`} />
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
