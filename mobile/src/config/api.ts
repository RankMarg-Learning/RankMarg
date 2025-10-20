import Constants from "expo-constants";

// API Configuration for React Native
export const API_CONFIG = {
  // Base URL for API calls
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl || 
           process.env.EXPO_PUBLIC_API_BASE_URL || 
           "http://localhost:3001",
  
  // Timeout settings
  timeout: {
    default: 10000, // 10 seconds
    production: 30000, // 30 seconds
  },
  
  // Retry settings
  retry: {
    maxRetries: 1,
    backoffMultiplier: 2,
    baseDelay: 200,
  },
  
  // Development settings
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL.endsWith('/') 
    ? API_CONFIG.baseURL.slice(0, -1) 
    : API_CONFIG.baseURL;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  return `${baseUrl}/api${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    signOut: '/auth/sign-out',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/profile',
  },
  // Add more endpoints as needed
  // users: '/users',
  // posts: '/posts',
} as const;
