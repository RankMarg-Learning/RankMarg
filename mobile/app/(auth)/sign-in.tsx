import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
} from "react-native";
import { router } from "expo-router";
import tw from "@/utils/tailwind";

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message) {
      setMessage("");
    }
  };

  const handleSignIn = async () => {
    if (!formData.username || !formData.password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage("Welcome back! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } catch {
      setMessage("Invalid username or password. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setMessage("Google sign-in not implemented yet");
    setMessageType("error");
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case "success":
        return "bg-green-50 text-green-600 border-green-200";
      case "error":
      default:
        return "bg-red-50 text-red-600 border-red-200";
    }
  };

  return (
    <View style={tw`flex-1 bg-gradient-to-b from-yellow-100 to-yellow-50`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`flex-1 items-center justify-center px-6`}>
            <View style={tw`w-full max-w-sm`}>
              <View style={tw`bg-white rounded-lg shadow-lg p-6`}>
                {/* Header */}
                <View style={tw`mb-6`}>
                  <Text style={tw`text-2xl font-bold text-center mb-2`}>
                    Welcome Back!
                  </Text>
                  <Text
                    style={tw`text-center text-sm text-gray-600 opacity-80`}
                  >
                    Sign in to access your personalized dashboard and continue
                    your journey
                  </Text>
                </View>

                {/* Form */}
                <View>
                  {/* Username/Email Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Email or Username
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900`}
                      placeholder="Your email or username"
                      placeholderTextColor="#9CA3AF"
                      value={formData.username}
                      onChangeText={(value) =>
                        handleInputChange("username", value.toLowerCase())
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Input */}
                  <View style={tw`mb-4`}>
                    <View
                      style={tw`flex-row items-center justify-between mb-2`}
                    >
                      <Text style={tw`text-sm font-medium text-gray-700`}>
                        Password
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push("/forgot-password")}
                      >
                        <Text style={tw`text-sm text-amber-600 underline`}>
                          Forgot your password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tw`relative`}>
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 pr-12`}
                        placeholder="Your password"
                        placeholderTextColor="#9CA3AF"
                        value={formData.password}
                        onChangeText={(value) =>
                          handleInputChange("password", value)
                        }
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={tw`absolute right-3 top-3`}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={tw`text-gray-500`}>
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Message Alert */}
                  {message && (
                    <View
                      style={tw`p-3 rounded-lg border mb-4 ${getMessageStyles()}`}
                    >
                      <Text style={tw`text-sm`}>{message}</Text>
                    </View>
                  )}

                  {/* Sign In Button */}
                  <TouchableOpacity
                    onPress={handleSignIn}
                    disabled={loading}
                    style={tw`bg-amber-500 rounded-lg py-3 px-4 mb-4 ${
                      loading ? "opacity-50" : ""
                    }`}
                  >
                    <Text
                      style={tw`text-white text-center font-semibold text-base`}
                    >
                      {loading ? "Signing In..." : "Login"}
                    </Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={tw`relative mb-6`}>
                    <View style={tw`absolute inset-0 flex items-center`}>
                      <View style={tw`flex-1 h-px bg-gray-200`} />
                    </View>
                    <View style={tw`relative flex justify-center`}>
                      <Text
                        style={tw`bg-white px-2 text-xs text-gray-500 uppercase`}
                      >
                        Or continue with
                      </Text>
                    </View>
                  </View>

                  {/* Google Sign In Button */}
                  <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    style={tw`border border-gray-300 rounded-lg py-3 px-4 bg-white mb-6`}
                  >
                    <View style={tw`flex-row items-center justify-center`}>
                      <Text style={tw`text-gray-700 font-semibold text-base`}>
                        Login with Google
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={tw`text-center`}>
                  <Text style={tw`text-sm text-gray-600`}>
                    New to our platform?{" "}
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/sign-up")}
                    >
                      <Text style={tw`text-amber-600 underline`}>
                        Create an account
                      </Text>
                    </TouchableOpacity>
                  </Text>

                  <Text style={tw`text-xs text-center text-gray-500 mt-4`}>
                    Protected by enterprise-grade security. We respect your
                    privacy.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
