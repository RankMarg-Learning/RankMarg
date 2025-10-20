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
import Svg, { Path } from 'react-native-svg';
import { Link, router } from "expo-router";
import tw from "@/utils/tailwind";
import { useSignIn } from "@/hooks/useAuth";
// Using simple text icons instead of lucide-react-native to avoid SVG dependency

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning"
  >("error");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // TanStack Query mutation
  const signInMutation = useSignIn();

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

    setMessage("");

    signInMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success && data.data) {
          setMessage("Welcome back! Redirecting...");
          setMessageType("success");

          // Redirect based on user role and status
          setTimeout(() => {
            if (data.data.isNewUser) {
              // Redirect to onboarding for new users
              router.replace("/onboarding" as any);
            } else {
              // All authenticated users go to dashboard
              router.replace("/dashboard" as any);
            }
          }, 500);
        } else {
          setMessage(data.message || "Login failed. Please try again.");
          setMessageType("error");
        }
      },
      onError: (error: any) => {
        console.error("Login failed:", error);

        if (error.response?.status === 401) {
          setMessage(
            "Invalid username or password. Please check your credentials and try again."
          );
        } else if (error.response?.status >= 500) {
          setMessage("Server error. Please try again later.");
        } else {
          setMessage(
            "An unexpected error occurred. Please check your connection and try again."
          );
        }
        setMessageType("error");
      },
    });
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
              <View style={tw`bg-card-light rounded-lg shadow-sm p-6`}>
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
                      style={tw`border rounded-lg px-4 py-3 bg-white text-gray-900 ${errors.username ? "border-red-300" : "border-gray-300"
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
                        <Text style={tw`text-sm text-primary-400 hover:text-primary-600 underline`}>
                          Forgot your password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tw`relative`}>
                      <TextInput
                        style={tw`border rounded-lg px-4 py-3 bg-white text-gray-900 pr-12 ${errors.password ? "border-red-300" : "border-gray-300"
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
                    disabled={signInMutation.isPending}
                    style={tw`bg-primary-400 rounded-lg py-3 px-4 mb-4 ${signInMutation.isPending ? "opacity-50" : ""
                      }`}
                  >
                    <View style={tw`flex-row items-center justify-center`}>
                      {signInMutation.isPending && (
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={tw`mr-2`}
                        />
                      )}
                      <Text
                        style={tw`text-white text-center font-semibold text-base`}
                      >
                        {signInMutation.isPending ? "Signing In..." : "Login"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={tw`relative mb-6`}>
                    <View style={tw`absolute inset-0 flex items-center`}>
                      <View style={tw`flex-1 h-px bg-border-light`} />
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
                      <Svg style={tw`mr-2 h-4 w-4`} width={24} height={24} viewBox="0 0 24 24">
                        <Path
                          d="M12.0001 4.67676C13.0358 4.67676 14.0783 5.01379 14.9571 5.65121L18.1868 2.45786C16.1994 0.851428 14.0215 0 12.0001 0C8.19786 0 4.80133 1.8833 2.80084 4.70755L6.0246 7.92534C7.07276 5.95617 9.39311 4.67676 12.0001 4.67676Z"
                          fill="#EA4335"
                        />
                        <Path
                          d="M23.49 12.2744C23.49 11.4608 23.4177 10.6473 23.2732 9.86816H12V14.4972H18.47C18.1894 16.0691 17.3213 17.4077 16.0739 18.308L19.1955 21.4396C21.3577 19.3149 23.49 16.2083 23.49 12.2744Z"
                          fill="#4285F4"
                        />
                        <Path
                          d="M5.95 14.3044C5.68 13.6107 5.53 12.8695 5.53 12.1008C5.53 11.3321 5.68 10.5908 5.95 9.89721L2.72621 6.67943C1.85843 8.29984 1.35181 10.1476 1.35181 12.1008C1.35181 14.054 1.85843 15.9017 2.72621 17.5222L5.95 14.3044Z"
                          fill="#FBBC05"
                        />
                        <Path
                          d="M12.0001 24.0001C14.0215 24.0001 15.855 23.359 17.3051 22.2692L14.1835 19.1376C13.3138 19.6606 12.24 20.0001 12.0001 20.0001C9.39311 20.0001 7.07276 18.7207 6.0246 16.7515L2.80084 19.9693C4.80133 22.7936 8.19786 24.0001 12.0001 24.0001Z"
                          fill="#34A853"
                        />
                      </Svg>
                      <Text style={tw`text-gray-700 font-semibold text-base`}>
                        Login with Google
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={tw`text-center`}>
                  <Text style={tw`text-sm text-muted-light justify-center`}>
                    New to our platform?{" "}
                    <Link
                      href="/(auth)/sign-up" style={tw`text-primary-400 hover:text-primary-600 underline `}>
                      Create an account
                    </Link>
                  </Text>

                  <Text style={tw`text-xs text-center text-muted-light mt-4`}>
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
