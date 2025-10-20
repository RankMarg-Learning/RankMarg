import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { API_ENDPOINTS } from "@/src/config/api";
import { tokenStorage, userStorage } from "@/src/utils/storage";

// Types
export interface SignInData {
  username: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isNewUser?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  message: string;
  token?: string;
  refreshToken?: string;
}

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Auth API functions
const authApi = {
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.auth.signIn, data);
    return response.data;
  },

  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.auth.signUp, data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(API_ENDPOINTS.auth.forgotPassword, data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(API_ENDPOINTS.auth.resetPassword, data);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get(API_ENDPOINTS.auth.me);
    return response.data;
  },

  signOut: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(API_ENDPOINTS.auth.signOut);
    return response.data;
  },
};

// Hooks
export const useSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: async (data) => {
      if (data.success && data.data) {
        // Store tokens and user data
        if (data.token) {
          await tokenStorage.setAuthToken(data.token);
        }
        if (data.refreshToken) {
          await tokenStorage.setRefreshToken(data.refreshToken);
        }
        await userStorage.setUserData(data.data);
        
        // Invalidate and refetch user data
        queryClient.setQueryData(authKeys.user(), data.data);
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
      }
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: async (data) => {
      if (data.success && data.data) {
        // Store tokens and user data
        if (data.token) {
          await tokenStorage.setAuthToken(data.token);
        }
        if (data.refreshToken) {
          await tokenStorage.setRefreshToken(data.refreshToken);
        }
        await userStorage.setUserData(data.data);
        
        // Invalidate and refetch user data
        queryClient.setQueryData(authKeys.user(), data.data);
        queryClient.invalidateQueries({ queryKey: authKeys.user() });
      }
    },
    onError: (error) => {
      console.error('Sign up failed:', error);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onError: (error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error) => {
      console.error('Reset password failed:', error);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: async () => {
      // Clear all stored data
      await tokenStorage.clearTokens();
      await userStorage.clearUserData();
      
      // Clear all auth data
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Sign out failed:', error);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // First try to get user data from storage
      const storedUserData = await userStorage.getUserData();
      const storedToken = await tokenStorage.getAuthToken();
      
      if (storedUserData && storedToken) {
        // Return stored data immediately for faster loading
        return { success: true, data: storedUserData };
      }
      
      // If no stored data, try to fetch from API
      return authApi.getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
