import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import tw from '@/utils/tailwind';
import { useAuthContext } from '@/src/context/AuthContext';
import { useSignOut } from '@/hooks/useAuth';
import { useHome } from '@/src/hooks/useHome';
import SmartStudyHub from '@/src/components/SmartStudyHub';
import SmartSubjectSession from '@/src/components/SmartSubjectSession';
import QuickNavigation from '@/src/components/QuickNavigation';

export default function DashboardScreen() {
  const { user, isAuthenticated, signOut } = useAuthContext();
  const signOutMutation = useSignOut();
  const [refreshing, setRefreshing] = React.useState(false);
  const { dashboardBasic, currentStudies, session, isLoading, isError } = useHome({ enabled: isAuthenticated });

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
        <View style={tw`px-6 py-6 gap-6`}>
          {isLoading && (
            <View style={tw`items-center py-4`}>
              <ActivityIndicator />
              <Text style={tw`text-gray-600 mt-2`}>Loading dashboard...</Text>
            </View>
          )}

          {isError && (
            <View style={tw`items-center py-4`}>
              <Text style={tw`text-red-600`}>Error loading data</Text>
            </View>
          )}

          {dashboardBasic && (
            <SmartStudyHub dashboardData={dashboardBasic} currentStudies={currentStudies} />
          )}

          {session?.length > 0 ? (
            <SmartSubjectSession session={session} />
          ) : (
            <View style={tw`items-center py-6`}>
              <Text style={tw`text-gray-700 font-semibold`}>There is no practice session for today.</Text>
              <Text style={tw`text-gray-500 mt-1`}>Please check back tomorrow or explore other learning resources.</Text>
            </View>
          )}

          <QuickNavigation />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
