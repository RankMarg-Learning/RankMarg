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

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

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

    setLoading(true);
    setMessage("");

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage(
        "Account created successfully. Redirecting to sign-in page..."
      );
      setMessageType("success");

      setTimeout(() => {
        router.push("/(auth)/sign-in");
      }, 1500);
    } catch {
      setMessage("Account creation failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setMessage("Google sign-up not implemented yet");
    setMessageType("error");
  };

  const canSubmit = () => {
    return (
      isUsernameAvailable &&
      !isCheckingUsername &&
      !loading &&
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
              <View style={tw`bg-white rounded-lg shadow-lg p-6`}>
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
                    disabled={!canSubmit() || loading}
                    style={tw`bg-amber-500 rounded-lg py-3 px-4 mb-4 ${
                      !canSubmit() || loading ? "opacity-50" : ""
                    }`}
                  >
                    <Text
                      style={tw`text-white text-center font-semibold text-base`}
                    >
                      {loading
                        ? "Creating your account..."
                        : "Create an account"}
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

                  {/* Google Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleGoogleSignUp}
                    style={tw`border border-gray-300 rounded-lg py-3 px-4 bg-white mb-6`}
                  >
                    <View style={tw`flex-row items-center justify-center`}>
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
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/sign-in")}
                    >
                      <Text style={tw`text-amber-600 underline`}>Sign in</Text>
                    </TouchableOpacity>
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
