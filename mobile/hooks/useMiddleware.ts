import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { checkRouteAccess, getDefaultRedirectUrl, RouteUtils } from '@/src/lib/AccessPage';
import { useCurrentUser } from './useAuth';
// Try to import from workspace package, fallback to local
import { Role } from '@repo/db/enums';

export interface MiddlewareResult {
  hasAccess: boolean;
  isLoading: boolean;
  redirectTo?: string;
  reason?: string;
}

/**
 * Mobile middleware hook for route protection
 * Handles authentication and authorization checks for routes
 */
export function useMiddleware(): MiddlewareResult {
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUserResponse, isLoading: userLoading, error } = useCurrentUser();
  const user = currentUserResponse?.data; // normalize to actual user object
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle special cases for root and auth pages
  const isRootOrAuthPage = pathname === '/' || 
    pathname === '/sign-in' || 
    pathname === '/sign-up' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  // Handle new user onboarding flow
  const isNewUser = user?.isNewUser;
  const isOnboardingPage = pathname === '/onboarding';

  useEffect(() => {
    // Don't redirect while loading user data
    if (userLoading || isRedirecting) return;

    // Handle root and auth pages with special redirect logic
    if (isRootOrAuthPage) {
      if (user && !error) {
        // Redirect authenticated users to their default page
        const redirectUrl = getDefaultRedirectUrl(user as any);
        if (pathname !== redirectUrl) {
          setIsRedirecting(true);
          router.replace(redirectUrl as any);
        }
      }
      return;
    }

    // Handle new user onboarding flow
    if (user && isNewUser && !isOnboardingPage) {
      setIsRedirecting(true);
      router.replace('/onboarding' as any);
      return;
    }

    // Check route access using the access control system
    const accessResult = checkRouteAccess(pathname, user as any);

    // If access is denied and we have a redirect destination
    if (!accessResult.hasAccess && accessResult.redirectTo) {
      setIsRedirecting(true);
      router.replace(accessResult.redirectTo as any);
      return;
    }

    // If access is denied but no specific redirect (shouldn't happen with our system)
    if (!accessResult.hasAccess) {
      // Fallback redirect based on authentication status
      const fallbackUrl = user ? '/unauthorized' : '/sign-in';
      setIsRedirecting(true);
      router.replace(fallbackUrl as any);
      return;
    }

    // Access granted
    setIsRedirecting(false);
  }, [pathname, user, userLoading, error, isRootOrAuthPage, isNewUser, isOnboardingPage, router]);

  // Reset redirecting state when pathname changes
  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  return {
    hasAccess: true, // If we reach here, access is granted
    isLoading: userLoading || isRedirecting,
    redirectTo: undefined,
  };
}

/**
 * Hook to check if current route requires authentication
 */
export function useRequiresAuth(): boolean {
  const pathname = usePathname();
  return RouteUtils.requiresAuth(pathname);
}

/**
 * Hook to check if current route is public
 */
export function useIsPublicRoute(): boolean {
  const pathname = usePathname();
  return RouteUtils.isPublicRoute(pathname);
}

/**
 * Hook to check if current route is admin-only
 */
export function useIsAdminRoute(): boolean {
  const pathname = usePathname();
  return RouteUtils.isAdminRoute(pathname);
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(requiredRole: Role): boolean {
  const { data: user } = useCurrentUser();
  
  return user?.data?.role === requiredRole;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(requiredRoles: Role[]): boolean {
  const { data: user } = useCurrentUser();
  return user?.data?.role ? requiredRoles.includes(user.data.role) : false;
}

/**
 * Hook to get user's accessible routes
 */
export function useAccessibleRoutes() {
  const { data: user } = useCurrentUser();
  if (!user?.data?.role) return [];
  return RouteUtils.getAccessibleRoutes(user.data.role);
}

/**
 * Hook to check if user can access a specific route
 */
export function useCanAccessRoute(routePath: string): boolean {
  const { data: user } = useCurrentUser();
  const accessResult = checkRouteAccess(routePath, user as any);
  return accessResult.hasAccess;
}
