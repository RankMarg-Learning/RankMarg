import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import tw from '@/utils/tailwind';
import { useAuthContext } from '@/src/context/AuthContext';
import { useSignOut } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { user, isAuthenticated, signOut } = useAuthContext();
  const signOutMutation = useSignOut();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <Text style={tw`text-lg text-gray-600`}>Please sign in to continue</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={tw`mt-4 bg-blue-500 px-6 py-3 rounded-lg`}
        >
          <Text style={tw`text-white font-semibold`}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={tw`bg-white px-6 py-4 shadow-sm`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View>
              <Text style={tw`text-2xl font-bold text-gray-900`}>
                Hello Dashboard! 👋
              </Text>
              <Text style={tw`text-gray-600 mt-1`}>
                Welcome back, {user?.username || 'User'}!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              disabled={signOutMutation.isPending}
              style={tw`bg-red-500 px-4 py-2 rounded-lg ${signOutMutation.isPending ? 'opacity-50' : ''}`}
            >
              <Text style={tw`text-white font-semibold`}>
                {signOutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={tw`px-6 py-6`}>
          {/* Welcome Card */}
          <View style={tw`bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6`}>
            <Text style={tw`text-white text-xl font-bold mb-2`}>
              🎉 Welcome to RankMarg!
            </Text>
            <Text style={tw`text-white/90 text-base`}>
              You've successfully logged in and can now access all features.
            </Text>
          </View>

          {/* User Info Card */}
          <View style={tw`bg-white rounded-xl p-6 mb-6 shadow-sm`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              Your Profile
            </Text>
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Username:</Text>
                <Text style={tw`font-semibold text-gray-900`}>{user?.username}</Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Email:</Text>
                <Text style={tw`font-semibold text-gray-900`}>{user?.email}</Text>
              </View>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Role:</Text>
                <Text style={tw`font-semibold text-blue-600`}>{user?.role}</Text>
              </View>
              {user?.isNewUser && (
                <View style={tw`bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3`}>
                  <Text style={tw`text-yellow-800 text-sm`}>
                    🆕 You're a new user! Complete your profile setup.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={tw`bg-white rounded-xl p-6 mb-6 shadow-sm`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              Quick Actions
            </Text>
            <View style={tw`space-y-3`}>
              <TouchableOpacity
                style={tw`bg-blue-50 border border-blue-200 rounded-lg p-4`}
                onPress={() => {
                  // TODO: Navigate to profile
                  console.log('Navigate to profile');
                }}
              >
                <Text style={tw`text-blue-800 font-semibold`}>
                  👤 Edit Profile
                </Text>
                <Text style={tw`text-blue-600 text-sm mt-1`}>
                  Update your personal information
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-green-50 border border-green-200 rounded-lg p-4`}
                onPress={() => {
                  // TODO: Navigate to settings
                  console.log('Navigate to settings');
                }}
              >
                <Text style={tw`text-green-800 font-semibold`}>
                  ⚙️ Settings
                </Text>
                <Text style={tw`text-green-600 text-sm mt-1`}>
                  Manage your app preferences
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-purple-50 border border-purple-200 rounded-lg p-4`}
                onPress={() => {
                  // TODO: Navigate to help
                  console.log('Navigate to help');
                }}
              >
                <Text style={tw`text-purple-800 font-semibold`}>
                  ❓ Help & Support
                </Text>
                <Text style={tw`text-purple-600 text-sm mt-1`}>
                  Get help and contact support
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Card */}
          <View style={tw`bg-white rounded-xl p-6 mb-6 shadow-sm`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              Your Stats
            </Text>
            <View style={tw`flex-row justify-between`}>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-blue-600`}>0</Text>
                <Text style={tw`text-gray-600 text-sm`}>Total Sessions</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-green-600`}>0</Text>
                <Text style={tw`text-gray-600 text-sm`}>Completed</Text>
              </View>
              <View style={tw`items-center`}>
                <Text style={tw`text-2xl font-bold text-purple-600`}>0</Text>
                <Text style={tw`text-gray-600 text-sm`}>In Progress</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={tw`bg-gray-100 rounded-xl p-6 mb-6`}>
            <Text style={tw`text-center text-gray-600 text-sm`}>
              🚀 You're all set! Start exploring the app features.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
