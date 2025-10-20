import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AlertCircle, ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import tw from "@/utils/tailwind";
import { useForgotPassword } from "@/hooks/useAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // TanStack Query mutation
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    setMessage("");

    forgotPasswordMutation.mutate({ email }, {
      onSuccess: (data) => {
        if (data.success) {
          setMessage("Check your email for the reset link");
        } else {
          setMessage(data.message || "Error sending email");
        }
      },
      onError: (error: any) => {
        setMessage(
          error?.response?.data?.message || 
          error?.response?.data?.error || 
          "Error sending email"
        );
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={tw`flex-1 justify-center items-center bg-background-light px-6`}
        keyboardShouldPersistTaps="handled"
      >
        <View style={tw`bg-card-light rounded-lg shadow-sm p-6 mx-4 w-full max-w-sm`}>
          {/* Header */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-2xl font-bold text-text-light mb-2`}>
              Forgot Password
            </Text>
            <Text style={tw`text-muted-light`}>
              Enter your email to reset your password
            </Text>
          </View>

          {/* Email Input */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
              Email
            </Text>
            <TextInput
              style={tw`border border-gray-300 rounded-lg px-4 py-3 text-base bg-white`}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!forgotPasswordMutation.isPending}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={tw`bg-primary-400 rounded-lg py-3 px-4 flex-row items-center justify-center ${
              forgotPasswordMutation.isPending ? "opacity-50" : ""
            }`}
            onPress={handleSubmit}
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={tw`text-white font-medium text-base mr-2`}>
                  Send Reset Link
                </Text>
                <ArrowRight size={16} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Message Display */}
          {message && (
            <View style={tw`flex-row items-center mt-4 p-3 bg-yellow-50 rounded-lg`}>
              <AlertCircle size={16} color="#D97706" style={tw`mr-2`} />
              <Text style={tw`text-yellow-700 text-sm flex-1`}>{message}</Text>
            </View>
          )}

          {/* Back to Sign In */}
          <TouchableOpacity
            style={tw`mt-6`}
            onPress={() => router.back()}
            disabled={forgotPasswordMutation.isPending}
          >
            <Text style={tw`text-center text-primary-400 font-medium`}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
