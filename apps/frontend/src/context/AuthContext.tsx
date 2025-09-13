"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { 
  AuthState, 
  AuthContextType, 
  User, 
  LoginCredentials, 
  AuthResponse,
  ROLE_PERMISSIONS,
  Permission
} from '@/types/auth.types';
import { Role } from '@repo/db/enums';

// Auth action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'REFRESH_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string };

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isLoading: true, // Start with loading true to check existing session
  isAuthenticated: false,
  accessToken: null,
  lastFetched: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        lastFetched: Date.now(),
      };
    
    case 'LOGIN_FAILURE':
    case 'LOGOUT':
      // Clear localStorage/sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_cache');
        sessionStorage.removeItem('auth_cache');
      }
      return {
        ...initialAuthState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...action.payload };
      
      // Update cache
      if (typeof window !== 'undefined') {
        const cacheData = {
          user: updatedUser,
          accessToken: state.accessToken,
          timestamp: Date.now(),
        };
        localStorage.setItem('auth_cache', JSON.stringify(cacheData));
      }
      
      return {
        ...state,
        user: updatedUser,
        lastFetched: Date.now(),
      };
    
    case 'REFRESH_USER':
      // Update cache
      if (typeof window !== 'undefined') {
        const cacheData = {
          user: action.payload,
          accessToken: state.accessToken,
          timestamp: Date.now(),
        };
        localStorage.setItem('auth_cache', JSON.stringify(cacheData));
      }
      
      return {
        ...state,
        user: action.payload,
        lastFetched: Date.now(),
      };
    
    case 'SET_TOKEN':
      return {
        ...state,
        accessToken: action.payload,
      };
    
    default:
      return state;
  }
};

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'auth_cache';

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const router = useRouter();

  // Load cached auth data on mount
  useEffect(() => {
    loadCachedAuth();
  }, []);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const interval = setInterval(() => {
        const now = Date.now();
        const lastFetch = state.lastFetched || 0;
        
        // Refresh if data is older than cache duration
        if (now - lastFetch > CACHE_DURATION) {
          refreshUser();
        }
      }, CACHE_DURATION);

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.lastFetched]);

  // Load cached authentication data
  const loadCachedAuth = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const { user, accessToken, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION && user && accessToken) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, accessToken } 
        });
        
        // Verify token is still valid with server
        try {
          await api.get('/auth/profile');
        } catch (error) {
          // Token expired or invalid, clear auth
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // Cache expired, try to refresh
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to load cached auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.post<AuthResponse>('/auth/sign-in', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        // Store in cache
        const cacheData = {
          user,
          accessToken,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, accessToken } 
        });

        // Determine redirect path
        const redirectTo = getRedirectPath(user);
        
        return { 
          success: true, 
          message: response.data.message,
          redirectTo 
        };
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/sign-out');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      router.push('/sign-in');
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success && response.data.data) {
        dispatch({ type: 'REFRESH_USER', payload: response.data.data });
      } else {
        // Profile fetch failed, likely token expired
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.isAuthenticated]);

  // Update user data locally
  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  // Check if user has required role(s)
  const hasRole = useCallback((requiredRole: Role | Role[]): boolean => {
    if (!state.user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(state.user.role);
  }, [state.user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!state.user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[state.user.role] as readonly Permission[] || [];
    return userPermissions.includes(permission);
  }, [state.user]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback((): boolean => {
    if (!state.user?.plan) return false;
    
    const { status, endAt } = state.user.plan;
    
    if (status === 'ACTIVE') return true;
    if (status === 'TRIAL' && endAt && new Date(endAt) > new Date()) return true;
    
    return false;
  }, [state.user]);

  // Get redirect path based on user role and status
  const getRedirectPath = useCallback((user?: User): string => {
    const currentUser = user || state.user;
    if (!currentUser) return '/sign-in';

    // If user hasn't completed onboarding, go to onboarding
    if (currentUser.isNewUser) {
      return '/onboarding';
    }

    // Redirect based on role
    switch (currentUser.role) {
      case Role.ADMIN:
        return '/admin';
      case Role.INSTRUCTOR:
        return '/instructor';
      case Role.USER:
      default:
        return '/dashboard';
    }
  }, [state.user]);


  // Memoized context value
  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    login,
    logout,
    refreshUser,
    updateUser,
    hasRole,
    hasPermission,
    isSubscriptionActive,
    getRedirectPath: () => getRedirectPath(),
  }), [
    state,
    login,
    logout,
    refreshUser,
    updateUser,
    hasRole,
    hasPermission,
    isSubscriptionActive,
    getRedirectPath,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple hook to get auth status (middleware handles routing)
export const useAuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  return { isLoading, isAuthenticated, user };
};

export default AuthContext;
