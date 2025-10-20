import React, { useState, useEffect } from "react";
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
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "@/utils/tailwind";
import { useResetPassword } from "@/hooks/useAuth";

const ResetPassword = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // TanStack Query mutation
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Must include a lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Must include an uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Must include a number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Must include a special character");
    }
    
    return errors;
  };

  const handleReset = async () => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    setError(null);

    const resetData = {
      token,
      password,
      confirmPassword,
    };

    resetPasswordMutation.mutate(resetData, {
      onSuccess: (data) => {
        if (data.success) {
          setPassword("");
          setConfirmPassword("");
          setSuccess(true);
        } else {
          setError(data.message || "Something went wrong");
        }
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.message || 
          err?.response?.data?.error || 
          "Something went wrong"
        );
      },
    });
  };

  if (success) {
    return (
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={tw`flex-1 justify-center items-center bg-background-light px-6`}
        >
          <View style={tw`bg-card-light rounded-lg shadow-sm p-6 mx-4 w-full max-w-sm`}>
            {/* Success Message */}
            <View style={tw`flex-row items-center mb-4 p-3 bg-green-50 rounded-lg`}>
              <CheckCircle2 size={20} color="#059669" style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-green-800 font-semibold text-base`}>
                  Success
                </Text>
                <Text style={tw`text-green-700 text-sm mt-1`}>
                  Password reset successfully. You can now log in.
                </Text>
              </View>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={tw`bg-primary-400 rounded-lg py-3 px-4`}
              onPress={() => router.replace("/(auth)/sign-in" as any)}
            >
              <Text style={tw`text-white font-medium text-base text-center`}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
              Reset Password
            </Text>
            <Text style={tw`text-muted-light`}>
              Enter your new password below
            </Text>
          </View>

          {/* New Password Input */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-medium text-text-light mb-2`}>
              New Password
            </Text>
            <View style={tw`relative`}>
              <TextInput
                style={tw`border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base bg-white`}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!resetPasswordMutation.isPending}
              />
              <TouchableOpacity
                style={tw`absolute right-3 top-3`}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-text-light mb-2`}>
              Confirm Password
            </Text>
            <View style={tw`relative`}>
              <TextInput
                style={tw`border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base bg-white`}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!resetPasswordMutation.isPending}
              />
              <TouchableOpacity
                style={tw`absolute right-3 top-3`}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={tw`flex-row items-center mb-4 p-3 bg-red-50 rounded-lg`}>
              <AlertCircle size={16} color="#DC2626" style={tw`mr-2`} />
              <Text style={tw`text-red-700 text-sm flex-1`}>{error}</Text>
            </View>
          )}

          {/* Reset Button */}
          <TouchableOpacity
            style={tw`bg-primary-400 rounded-lg py-3 px-4 flex-row items-center justify-center ${
              resetPasswordMutation.isPending ? "opacity-50" : ""
            }`}
            onPress={handleReset}
            disabled={resetPasswordMutation.isPending || !token}
          >
            {resetPasswordMutation.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={tw`text-white font-medium text-base`}>
                Reset Password
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={tw`mt-6`}
            onPress={() => router.back()}
            disabled={resetPasswordMutation.isPending}
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

export default ResetPassword;
