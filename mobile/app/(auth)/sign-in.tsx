import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import tw from "@/utils/tailwind";
// Using simple text icons instead of lucide-react-native to avoid SVG dependency

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning"
  >("error");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message) {
      setMessage("");
    }
    // Clear field-specific error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/sign-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setMessage("Welcome back! Redirecting...");
        setMessageType("success");

        // TODO: Implement proper routing based on user role
        // if (user.isNewUser) {
        //   router.replace("/onboarding" as any);
        // } else {
        //   switch (user.role) {
        //     case 'ADMIN':
        //       router.replace("/admin" as any);
        //       break;
        //     case 'INSTRUCTOR':
        //       router.replace("/instructor" as any);
        //       break;
        //     default:
        //       router.replace("/dashboard" as any);
        //   }
        // }

        setTimeout(() => {
          router.replace("/" as any);
        }, 500);
      } else {
        setMessage(data.message || "Login failed. Please try again.");
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.message?.includes("UNAUTHORIZED")) {
        setMessage(
          "Invalid username or password. Please check your credentials and try again."
        );
      } else if (error.message?.includes("500")) {
        setMessage("Server error. Please try again later.");
      } else {
        setMessage(
          "An unexpected error occurred. Please check your connection and try again."
        );
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      // TODO: Implement proper Google OAuth for mobile
      setMessage("Google sign-in not implemented yet");
      setMessageType("error");
    } catch (error) {
      console.error("Google login failed:", error);
      setMessage("Failed to initiate Google login. Please try again.");
      setMessageType("error");
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case "success":
        return "bg-green-50 text-green-600 border-green-200";
      case "warning":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
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
                      style={tw`border rounded-lg px-4 py-3 bg-white text-gray-900 ${
                        errors.username ? "border-red-300" : "border-gray-300"
                      }`}
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
                    {errors.username && (
                      <Text style={tw`text-red-500 text-sm mt-1`}>
                        {errors.username}
                      </Text>
                    )}
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
                        onPress={() => router.push("/(auth)/forgot-password")}
                      >
                        <Text style={tw`text-sm text-amber-600 underline`}>
                          Forgot your password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tw`relative`}>
                      <TextInput
                        style={tw`border rounded-lg px-4 py-3 bg-white text-gray-900 pr-12 ${
                          errors.password ? "border-red-300" : "border-gray-300"
                        }`}
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
                        <Text style={tw`text-gray-500 text-lg`}>
                          {showPassword ? "🙈" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={tw`text-red-500 text-sm mt-1`}>
                        {errors.password}
                      </Text>
                    )}
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
                    <View style={tw`flex-row items-center justify-center`}>
                      {loading && (
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={tw`mr-2`}
                        />
                      )}
                      <Text
                        style={tw`text-white text-center font-semibold text-base`}
                      >
                        {loading ? "Signing In..." : "Login"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={tw`relative mb-6`}>
                    <View style={tw`absolute inset-0 flex items-center`}>
                      <View style={tw`flex-1 h-px bg-gray-200`} />
                    </View>
                    <View
                      style={tw`relative flex justify-center text-xs uppercase`}
                    >
                      <Text style={tw`bg-white px-2 text-gray-500`}>
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
                      <svg style={tw`mr-2 h-4 w-4`} viewBox="0 0 24 24">
                        <path
                          d="M12.0001 4.67676C13.0358 4.67676 14.0783 5.01379 14.9571 5.65121L18.1868 2.45786C16.1994 0.851428 14.0215 0 12.0001 0C8.19786 0 4.80133 1.8833 2.80084 4.70755L6.0246 7.92534C7.07276 5.95617 9.39311 4.67676 12.0001 4.67676Z"
                          fill="#EA4335"
                        />
                        <path
                          d="M23.49 12.2744C23.49 11.4608 23.4177 10.6473 23.2732 9.86816H12V14.4972H18.47C18.1894 16.0691 17.3213 17.4077 16.0739 18.308L19.1955 21.4396C21.3577 19.3149 23.49 16.2083 23.49 12.2744Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M5.95 14.3044C5.68 13.6107 5.53 12.8695 5.53 12.1008C5.53 11.3321 5.68 10.5908 5.95 9.89721L2.72621 6.67943C1.85843 8.29984 1.35181 10.1476 1.35181 12.1008C1.35181 14.054 1.85843 15.9017 2.72621 17.5222L5.95 14.3044Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12.0001 24.0001C14.0215 24.0001 15.855 23.359 17.3051 22.2692L14.1835 19.1376C13.3138 19.6606 12.24 20.0001 12.0001 20.0001C9.39311 20.0001 7.07276 18.7207 6.0246 16.7515L2.80084 19.9693C4.80133 22.7936 8.19786 24.0001 12.0001 24.0001Z"
                          fill="#34A853"
                        />
                      </svg>
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
                      <Text style={tw`text-yellow-600 underline`}>
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
