import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentUser, useSignOut, User } from '@/hooks/useAuth';
// Try to import from workspace package, fallback to local
import { Role } from '@/src/types/enums';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const signOutMutation = useSignOut();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthenticated = !!user && !isLoading;
  const isNewUser = user?.data?.isNewUser || false;

  const hasRole = (role: Role): boolean => {
        return user?.data?.role === role;
    };

  const hasAnyRole = (roles: Role[]): boolean => {
    return user?.data?.role ? roles.includes(user.data.role as Role) : false;
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsSigningOut(true);
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsSigningOut(false);
    }
  };

  const refreshUser = (): void => {
    refetch();
  };

  const value: AuthContextType = {
    user: user?.data as User | null,
    isLoading: isLoading || isSigningOut,
    isAuthenticated,
    isNewUser,
    hasRole,
    hasAnyRole,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks for common auth checks
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

export function useIsNewUser(): boolean {
  const { isNewUser } = useAuthContext();
  return isNewUser;
}

export function useUserRole(): Role | null {
  const { user } = useAuthContext();
  return user?.role as unknown as Role | null;
}

export function useIsAdmin(): boolean {
  const { hasAnyRole } = useAuthContext();
  return hasAnyRole([Role.ADMIN, Role.INSTRUCTOR]);
}

export function useIsUser(): boolean {
  const { hasRole } = useAuthContext();
  return hasRole(Role.USER);
}
