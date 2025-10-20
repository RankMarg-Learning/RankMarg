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
import { Link, router } from "expo-router";
import tw from "@/utils/tailwind";
import Svg, { Path } from "react-native-svg";
import { useSignUp } from "@/hooks/useAuth";

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // TanStack Query mutation
  const signUpMutation = useSignUp();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message) {
      setMessage("");
    }

    // Check username availability
    if (field === "username" && value.trim()) {
      checkUsernameAvailability(value.toLowerCase());
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.trim() === "") {
      setIsUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsUsernameAvailable(Math.random() > 0.5); // Simulate availability check
    } catch {
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      setMessage("Full name is required");
      setMessageType("error");
      return false;
    }
    if (!formData.username.trim()) {
      setMessage("Username is required");
      setMessageType("error");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setMessage("Username must contain only letters, numbers, or underscores");
      setMessageType("error");
      return false;
    }
    if (!isUsernameAvailable) {
      setMessage("Please choose an available username");
      setMessageType("error");
      return false;
    }
    if (!formData.email.trim()) {
      setMessage("Email is required");
      setMessageType("error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return false;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setMessageType("error");
      return false;
    }
    if (!/[a-zA-Z]/.test(formData.password)) {
      setMessage("Password must contain at least one letter");
      setMessageType("error");
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setMessage("Password must contain at least one number");
      setMessageType("error");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setMessage("");

    const signUpData = {
      fullname: formData.fullname,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    signUpMutation.mutate(signUpData, {
      onSuccess: (data) => {
        if (data.success) {
          setMessage(
            "Account created successfully! Welcome to RankMarg!"
          );
          setMessageType("success");

          setTimeout(() => {
            // Redirect to onboarding after successful signup (new users)
            router.replace("/onboarding");
          }, 1500);
        } else {
          setMessage(data.message || "Account creation failed. Please try again.");
          setMessageType("error");
        }
      },
      onError: (error: any) => {
        console.error("Sign up failed:", error);
        setMessage("Account creation failed. Please try again.");
        setMessageType("error");
      },
    });
  };

  const handleGoogleSignUp = () => {
    setMessage("Google sign-up not implemented yet");
    setMessageType("error");
  };

  const canSubmit = () => {
    return (
      isUsernameAvailable &&
      !isCheckingUsername &&
      !signUpMutation.isPending &&
      formData.username.trim() !== ""
    );
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
          {/* Back Button */}
          <View style={tw`pt-16 px-6 pb-5`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={tw`self-start`}
            >
              <Text style={tw`text-base font-medium text-amber-600`}>
                ← Back
              </Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-1 items-center justify-center px-6`}>
            <View style={tw`w-full max-w-sm`}>
              <View style={tw`bg-card-light rounded-lg shadow-sm p-6`}>
                {/* Header */}
                <View style={tw`mb-6`}>
                  <Text style={tw`text-xl font-bold text-center mb-2`}>
                    Join Our Community
                  </Text>
                  <Text
                    style={tw`text-center text-sm text-gray-600 opacity-80`}
                  >
                    Create your account and start your journey with us today
                  </Text>
                </View>

                {/* Form */}
                <View>
                  {/* Full Name Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Full Name
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900`}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      value={formData.fullname}
                      onChangeText={(value) =>
                        handleInputChange("fullname", value)
                      }
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Username Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Username
                    </Text>
                    <View style={tw`relative`}>
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 ${
                          !isUsernameAvailable ? "border-red-300" : ""
                        }`}
                        placeholder="Choose a unique username"
                        placeholderTextColor="#9CA3AF"
                        value={formData.username}
                        onChangeText={(value) =>
                          handleInputChange("username", value.toLowerCase())
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {isCheckingUsername && formData.username && (
                        <View style={tw`absolute right-2 top-2`}>
                          <Text style={tw`text-gray-400`}>⟳</Text>
                        </View>
                      )}
                    </View>
                    {isCheckingUsername && formData.username && (
                      <Text style={tw`text-xs italic text-gray-600 mt-1`}>
                        Checking availability...
                      </Text>
                    )}
                    {!isUsernameAvailable &&
                      formData.username &&
                      formData.username.trim() !== "" &&
                      !isCheckingUsername && (
                        <Text style={tw`text-xs text-red-500 mt-1`}>
                          This username is already taken. Please choose another
                          one.
                        </Text>
                      )}
                    {isUsernameAvailable &&
                      formData.username &&
                      formData.username.trim() !== "" &&
                      !isCheckingUsername && (
                        <Text style={tw`text-xs text-green-600 mt-1`}>
                          Username is available!
                        </Text>
                      )}
                  </View>

                  {/* Email Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Email
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900`}
                      placeholder="Your email address"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={(value) =>
                        handleInputChange("email", value)
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Password
                    </Text>
                    <View style={tw`relative`}>
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 pr-12`}
                        placeholder="Create a secure password"
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

                  {/* Confirm Password Input */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                      Confirm Password
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900`}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        handleInputChange("confirmPassword", value)
                      }
                      secureTextEntry={!showPassword}
                    />
                  </View>

                  {/* Message Alert */}
                  {message && (
                    <View
                      style={tw`p-3 rounded-lg border mb-4 ${getMessageStyles()}`}
                    >
                      <Text style={tw`text-sm`}>{message}</Text>
                    </View>
                  )}

                  {/* Create Account Button */}
                  <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={!canSubmit() || signUpMutation.isPending}
                    style={tw`bg-amber-500 rounded-lg py-3 px-4 mb-4 ${
                      !canSubmit() || signUpMutation.isPending ? "opacity-50" : ""
                    }`}
                  >
                    <View style={tw`flex-row items-center justify-center`}>
                      {signUpMutation.isPending && (
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={tw`mr-2`}
                        />
                      )}
                      <Text
                        style={tw`text-white text-center font-semibold text-base`}
                      >
                        {signUpMutation.isPending
                          ? "Creating your account..."
                          : "Create an account"}
                      </Text>
                    </View>
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

                  {/* Google Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleGoogleSignUp}
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
                        Sign up with Google
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={tw`text-center`}>
                  <Text style={tw`text-sm text-gray-600`}>
                    Already have an account?{" "}
                    <Link
                      href="/(auth)/sign-in" style={tw`text-primary-400 hover:text-primary-600 underline `}>
                      Sign in
                    </Link>
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
