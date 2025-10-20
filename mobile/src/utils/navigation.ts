import { router } from 'expo-router';
import { checkRouteAccess, getDefaultRedirectUrl, RouteUtils } from '@/src/lib/AccessPage';
// Try to import from workspace package, fallback to local
import { Role } from '@repo/db/enums';

/**
 * Navigation utilities for the mobile app
 * Provides type-safe navigation with access control
 */

export interface NavigationOptions {
  replace?: boolean;
  params?: Record<string, any>;
}

/**
 * Navigate to a route with access control
 */
export function navigateTo(
  route: string, 
  user: { role?: Role } | null,
  options: NavigationOptions = {}
): boolean {
  // Check if user has access to the route
  const accessResult = checkRouteAccess(route, user);
  
  if (!accessResult.hasAccess) {
    console.warn(`Access denied to route: ${route}. Reason: ${accessResult.reason}`);
    
    // Redirect to appropriate page
    if (accessResult.redirectTo) {
      if (options.replace) {
        router.replace(accessResult.redirectTo as any);
      } else {
        router.push(accessResult.redirectTo as any);
      }
    }
    return false;
  }

  // Navigate to the route
  if (options.replace) {
    router.replace(route as any);
  } else {
    router.push(route as any);
  }
  
  return true;
}

/**
 * Navigate to user's default page based on their role
 */
export function navigateToDefault(user: { role?: Role } | null): void {
  const defaultRoute = getDefaultRedirectUrl(user);
  router.replace(defaultRoute as any);
}

/**
 * Navigate to authentication pages
 */
export const AuthNavigation = {
  signIn: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/sign-in' as any);
    } else {
      router.push('/sign-in' as any);
    }
  },
  
  signUp: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/sign-up' as any);
    } else {
      router.push('/sign-up' as any);
    }
  },
  
  forgotPassword: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/forgot-password' as any);
    } else {
      router.push('/forgot-password' as any);
    }
  },
  
  resetPassword: (token: string, options: NavigationOptions = {}) => {
    const route = `/reset-password?token=${encodeURIComponent(token)}`;
    if (options.replace) {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  },
};

/**
 * Navigate to protected user pages
 */
export const UserNavigation = {
  dashboard: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/dashboard' as any);
    } else {
      router.push('/dashboard' as any);
    }
  },
  
  profile: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/profile' as any);
    } else {
      router.push('/profile' as any);
    }
  },
  
  settings: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/settings' as any);
    } else {
      router.push('/settings' as any);
    }
  },
  
  tests: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/tests' as any);
    } else {
      router.push('/tests' as any);
    }
  },
  
  test: (testId: string, options: NavigationOptions = {}) => {
    const route = `/test/${testId}`;
    if (options.replace) {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  },
  
  analytics: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/analytics' as any);
    } else {
      router.push('/analytics' as any);
    }
  },
  
  leaderboard: (testId?: string, options: NavigationOptions = {}) => {
    const route = testId ? `/leaderboard/${testId}` : '/leaderboard';
    if (options.replace) {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  },
};

/**
 * Navigate to admin pages
 */
export const AdminNavigation = {
  dashboard: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin' as any);
    } else {
      router.push('/admin' as any);
    }
  },
  
  questions: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin/questions' as any);
    } else {
      router.push('/admin/questions' as any);
    }
  },
  
  addQuestion: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin/questions/add' as any);
    } else {
      router.push('/admin/questions/add' as any);
    }
  },
  
  editQuestion: (questionId: string, options: NavigationOptions = {}) => {
    const route = `/admin/questions/${questionId}/edit`;
    if (options.replace) {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  },
  
  tests: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin/tests' as any);
    } else {
      router.push('/admin/tests' as any);
    }
  },
  
  addTest: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin/tests/add' as any);
    } else {
      router.push('/admin/tests/add' as any);
    }
  },
  
  bulkUpload: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/admin/bulk-upload' as any);
    } else {
      router.push('/admin/bulk-upload' as any);
    }
  },
};

/**
 * Navigate to special pages
 */
export const SpecialNavigation = {
  onboarding: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/onboarding' as any);
    } else {
      router.push('/onboarding' as any);
    }
  },
  
  unauthorized: (fromUrl?: string, options: NavigationOptions = {}) => {
    const route = fromUrl ? `/unauthorized?from=${encodeURIComponent(fromUrl)}` : '/unauthorized';
    if (options.replace) {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  },
  
  home: (options: NavigationOptions = {}) => {
    if (options.replace) {
      router.replace('/' as any);
    } else {
      router.push('/' as any);
    }
  },
};

/**
 * Check if a route is accessible to the user
 */
export function canNavigateTo(route: string, user: { role?: Role } | null): boolean {
  const accessResult = checkRouteAccess(route, user);
  return accessResult.hasAccess;
}

/**
 * Get all accessible routes for a user
 */
export function getAccessibleRoutes(user: { role?: Role } | null): string[] {
  if (!user?.role) {
    return RouteUtils.getAccessibleRoutes(Role.USER).map(config => config.path);
  }
  
  return RouteUtils.getAccessibleRoutes(user.role).map(config => config.path);
}

/**
 * Navigate back with fallback
 */
export function navigateBack(fallbackRoute: string = '/'): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
}

/**
 * Replace current route
 */
export function replaceRoute(route: string): void {
  router.replace(route as any);
}

/**
 * Push new route
 */
export function pushRoute(route: string): void {
  router.push(route as any);
}
