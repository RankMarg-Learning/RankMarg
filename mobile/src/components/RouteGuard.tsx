import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useMiddleware } from '@/hooks/useMiddleware';
import { useAuthContext } from '@/src/context/AuthContext';
// Try to import from workspace package, fallback to local
import { Role } from '@/src/types/enums';
interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * Main route guard component that handles authentication and authorization
 */
export function RouteGuard({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  const { isLoading } = useMiddleware();
  const { isLoading: authLoading } = useAuthContext();

  if (isLoading || authLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Guard that requires authentication
 */
export function RequireAuth({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return fallback || <UnauthorizedScreen message="Authentication required" />;
  }

  return <>{children}</>;
}

/**
 * Guard that requires specific role
 */
interface RequireRoleProps extends RouteGuardProps {
  role: Role;
}

export function RequireRole({ 
  children, 
  role, 
  fallback,
  loadingComponent 
}: RequireRoleProps) {
  const { hasRole, isLoading } = useAuthContext();

  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  if (!hasRole(role)) {
    return fallback || <UnauthorizedScreen message={`${role} role required`} />;
  }

  return <>{children}</>;
}

/**
 * Guard that requires any of the specified roles
 */
interface RequireAnyRoleProps extends RouteGuardProps {
  roles: Role[];
}

export function RequireAnyRole({ 
  children, 
  roles, 
  fallback,
  loadingComponent 
}: RequireAnyRoleProps) {
  const { hasAnyRole, isLoading } = useAuthContext();

  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  if (!hasAnyRole(roles)) {
    return fallback || <UnauthorizedScreen message="Insufficient permissions" />;
  }

  return <>{children}</>;
}

/**
 * Guard that requires admin or instructor role
 */
export function RequireAdmin({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  return (
    <RequireAnyRole 
      roles={[Role.ADMIN, Role.INSTRUCTOR]} 
      fallback={fallback}
      loadingComponent={loadingComponent}
    >
      {children}
    </RequireAnyRole>
  );
}

/**
 * Guard that requires user role (regular user)
 */
export function RequireUser({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  return (
    <RequireRole 
      role={Role.USER} 
      fallback={fallback}
      loadingComponent={loadingComponent}
    >
      {children}
    </RequireRole>
  );
}

/**
 * Guard for new users (redirects to onboarding)
 */
export function RequireOnboarding({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  const { isNewUser, isLoading } = useAuthContext();

  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  if (isNewUser) {
    return fallback || <OnboardingRedirectScreen />;
  }

  return <>{children}</>;
}

/**
 * Guard for authenticated users (redirects away from auth pages)
 */
export function RequireGuest({ 
  children, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  if (isAuthenticated) {
    return fallback || <AuthenticatedRedirectScreen />;
  }

  return <>{children}</>;
}

// Screen Components
function LoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function UnauthorizedScreen({ message }: { message: string }) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorTitle}>Access Denied</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </View>
  );
}

function OnboardingRedirectScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Redirecting to onboarding...</Text>
    </View>
  );
}

function AuthenticatedRedirectScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
