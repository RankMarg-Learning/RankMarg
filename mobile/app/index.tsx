import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthContext } from '@/src/context/AuthContext';
import { SplashScreen } from '@/src/components/SplashScreen';

export default function Index() {
  const { isAuthenticated, isLoading, isNewUser } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect based on user status
        if (isNewUser) {
          // Redirect to onboarding for new users
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // User is not authenticated, redirect to auth
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, isLoading, isNewUser]);

  // Show splash screen while checking authentication
  return <SplashScreen message="Checking authentication status..." />;
}
