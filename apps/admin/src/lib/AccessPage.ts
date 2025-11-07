import { Role } from "@repo/db/enums";

/**
 * Route Access Control System
 * 
 * This system categorizes routes into different access levels:
 * - PUBLIC: No authentication required
 * - AUTHENTICATED: Requires login but no specific role
 * - PROTECTED: Requires specific roles
 * - ADMIN: Admin/Instructor only
 */

export enum RouteType {
  EXACT = "exact",           // Exact path match
  DYNAMIC = "dynamic",       // Contains parameters (:param)
  WILDCARD = "wildcard",     // Prefix matching (ends with /*)
}

export enum AccessLevel {
  PUBLIC = "public",
  AUTHENTICATED = "authenticated",
  PROTECTED = "protected",
  ADMIN = "admin",
}

export interface RouteConfig {
  path: string;
  type: RouteType;
  access: AccessLevel;
  roles?: Role[];
  description?: string;
}

// All authenticated users (any role)
const ALL_AUTHENTICATED_ROLES = [Role.USER, Role.ADMIN, Role.INSTRUCTOR];
const ADMIN_ROLES = [Role.ADMIN, Role.INSTRUCTOR];
const ADMIN_ONLY = [Role.ADMIN];

export const routeConfigs: RouteConfig[] = [
  // ==================== PUBLIC ROUTES ====================
  // Root and landing pages
  { path: "/", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Landing page" },
  { path: "/pricing", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Pricing page" },
  
  // Authentication routes
  { path: "/sign-in", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Sign in page" },
  { path: "/sign-up", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Sign up page" },
  { path: "/forgot-password", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Forgot password" },
  { path: "/reset-password", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Reset password" },
  
  // Support and marketing pages
  { path: "/about-us", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "About us" },
  { path: "/contact-us", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Contact us" },
  { path: "/faqs", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "FAQs" },
  { path: "/get-started", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Get started guide" },
  { path: "/help-support", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Help and support" },
  { path: "/privacy-policy", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Privacy policy" },
  { path: "/refunds", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Refunds policy" },
  { path: "/terms", type: RouteType.EXACT, access: AccessLevel.PUBLIC, description: "Terms of service" },
  
  // Blog routes
  { path: "/posts", type: RouteType.EXACT, access: AccessLevel.PROTECTED,roles:ADMIN_ONLY, description: "Blog posts list" },
  { path: "/post/:slugs", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED,roles:ADMIN_ONLY, description: "Individual blog post" },

  // ==================== AUTHENTICATED ROUTES ====================
  // Special routes for all authenticated users
  { path: "/onboarding", type: RouteType.EXACT, access: AccessLevel.AUTHENTICATED, roles: ALL_AUTHENTICATED_ROLES, description: "User onboarding" },
  { path: "/set/username", type: RouteType.EXACT, access: AccessLevel.AUTHENTICATED, roles: ALL_AUTHENTICATED_ROLES, description: "Username setup" },
  { path: "/unauthorized", type: RouteType.EXACT, access: AccessLevel.AUTHENTICATED, roles: ALL_AUTHENTICATED_ROLES, description: "Unauthorized access page" },

  // ==================== PROTECTED USER ROUTES ====================
  // Main dashboard and navigation
  { path: "/dashboard", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Main dashboard" },
  
  // Practice and AI features
  { path: "/ai-practice", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "AI practice mode" },
  { path: "/ai-practice/recent-results", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Recent AI practice results" },
  { path: "/ai-session/:sessionId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "AI practice session" },
  
  // Test and assessment routes
  { path: "/tests", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Tests overview" },
  { path: "/tests/results", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Test results" },
  { path: "/tests/thank-you", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Test completion thank you" },
  { path: "/test/:testId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Take test" },
  { path: "/test/:testId/instructions", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Test instructions" },
  
  // Question and practice routes
  { path: "/question/:slug", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Individual question" },
  
  // Analytics and progress tracking
  { path: "/analysis/:testId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Test analysis" },
  { path: "/analytics", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "User analytics" },
  { path: "/mastery", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Mastery overview" },
  { path: "/mastery/:subjectId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Subject mastery" },
  { path: "/mistakes-tracker", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Mistakes tracker" },
  
  // User profile and social features
  { path: "/profile", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "User profile" },
  { path: "/u/:username", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: [Role.USER, Role.ADMIN], description: "Public user profile" },
  { path: "/settings", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "User settings" },
  { path: "/leaderboard", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Leaderboard" },
  { path: "/leaderboard/:testId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Test leaderboard" },
  
  // Curriculum and learning paths
  { path: "/my-curriculum", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Personal curriculum" },
  
  // Payment and subscription
  { path: "/payment", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Payment page" },
  { path: "/subscription", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Subscription management" },
  
  // Challenge system
  { path: "/challenge", type: RouteType.EXACT, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Challenges overview" },
  { path: "/challenge/:challengeId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Individual challenge" },
  { path: "/review/:challengeId", type: RouteType.DYNAMIC, access: AccessLevel.PROTECTED, roles: ALL_AUTHENTICATED_ROLES, description: "Challenge review" },

  // ==================== ADMIN/INSTRUCTOR ROUTES ====================
  // Advanced test management
  { path: "/tests/subject-wise", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Subject-wise tests (admin)" },
  { path: "/tests/topic-wise", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Topic-wise tests (admin)" },
  
  // Question management for instructors/admins
  { path: "/questions", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "Question bank management" },
  { path: "/questions/:subject", type: RouteType.DYNAMIC, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Subject questions" },
  { path: "/questions/:subject/:topic", type: RouteType.DYNAMIC, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Topic questions" },
  
  // Admin management features
  { path: "/questionset", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "Question set management" },
  { path: "/rank-points", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "Rank points management" },
  
  // ==================== ADMIN PANEL ROUTES ====================
  // Main admin routes
  { path: "/admin", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Admin dashboard" },
  
  // Question management
  { path: "/admin/questions", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Admin question management" },
  { path: "/admin/questions/add", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Add new question" },
  { path: "/admin/questions/:id/edit", type: RouteType.DYNAMIC, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Edit question" },
  
  // Bulk operations
  { path: "/admin/bulk-upload", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Bulk upload questions" },
  { path: "/admin/pdf-upload", type: RouteType.WILDCARD, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "PDF upload management" },
  
  // Test management
  { path: "/admin/tests", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Admin test management" },
  { path: "/admin/tests/add", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Create new test" },
  { path: "/admin/tests/create", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Test creation wizard" },
  { path: "/admin/tests/:id", type: RouteType.DYNAMIC, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Manage specific test" },
  
  // Other admin features
  { path: "/admin/curriculum", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ROLES, description: "Curriculum management" },
  { path: "/admin/plans", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "Subscription plans" },
  { path: "/admin/promocodes", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "Promo codes management" },
  {path:"/admin/user-subscriptions", type: RouteType.EXACT, access: AccessLevel.ADMIN, roles: ADMIN_ONLY, description: "User subscriptions management" },
];


export function matchesRoute(urlPath: string, routePattern: string, routeType: RouteType): boolean {
  // Remove query parameters and normalize
  const cleanUrl = urlPath.split("?")[0];
  const urlSegments = cleanUrl.split("/").filter(Boolean);
  const patternSegments = routePattern.split("/").filter(Boolean);
  
  switch (routeType) {
    case RouteType.EXACT:
      // Exact match
      return cleanUrl === routePattern;
      
    case RouteType.DYNAMIC:
      // Dynamic routes with parameters (:param)
      if (urlSegments.length !== patternSegments.length) return false;
      
      return patternSegments.every((segment, index) => {
        if (segment.startsWith(":")) {
          // Dynamic parameter - matches any non-empty segment
          return urlSegments[index] && urlSegments[index].length > 0;
        }
        return segment === urlSegments[index];
      });
      
    case RouteType.WILDCARD:
      // Wildcard matching - route pattern is a prefix
      const prefix = routePattern.endsWith("/*") 
        ? routePattern.slice(0, -2) 
        : routePattern;
      return cleanUrl.startsWith(prefix);
      
    default:
      return false;
  }
}

/**
 * Finds the route configuration that matches the given URL path
 */
export function findMatchingRoute(urlPath: string): RouteConfig | null {
  // Sort by specificity: exact > dynamic > wildcard
  const sortedConfigs = [...routeConfigs].sort((a, b) => {
    if (a.type === RouteType.EXACT && b.type !== RouteType.EXACT) return -1;
    if (b.type === RouteType.EXACT && a.type !== RouteType.EXACT) return 1;
    if (a.type === RouteType.DYNAMIC && b.type === RouteType.WILDCARD) return -1;
    if (b.type === RouteType.DYNAMIC && a.type === RouteType.WILDCARD) return 1;
    return 0;
  });
  
  for (const config of sortedConfigs) {
    if (matchesRoute(urlPath, config.path, config.type)) {
      return config;
    }
  }
  
  return null;
}

/**
 * Checks if a user has access to a specific route
 */
export function hasRouteAccess(
  routeConfig: RouteConfig, 
  user: { role?: Role } | null
): { hasAccess: boolean; reason?: string } {
  switch (routeConfig.access) {
    case AccessLevel.PUBLIC:
      return { hasAccess: true };
      
    case AccessLevel.AUTHENTICATED:
      if (!user) {
        return { hasAccess: false, reason: "Authentication required" };
      }
      return { hasAccess: true };
      
    case AccessLevel.PROTECTED:
    case AccessLevel.ADMIN:
      if (!user) {
        return { hasAccess: false, reason: "Authentication required" };
      }
      
      if (!user.role) {
        return { hasAccess: false, reason: "User role not defined" };
      }
      
      if (!routeConfig.roles || routeConfig.roles.length === 0) {
        return { hasAccess: false, reason: "Route roles not defined" };
      }
      
      if (!routeConfig.roles.includes(user.role)) {
        return { hasAccess: false, reason: "Insufficient permissions" };
      }
      
      return { hasAccess: true };
      
    default:
      return { hasAccess: false, reason: "Unknown access level" };
  }
}

/**
 * Complete access check for a URL path and user
 */
export function checkRouteAccess(
  urlPath: string, 
  user: { role?: Role } | null
): {
  hasAccess: boolean;
  routeConfig: RouteConfig | null;
  reason?: string;
  redirectTo?: string;
} {
  const routeConfig = findMatchingRoute(urlPath);
  
  // If no route config found, it's an unknown route
  if (!routeConfig) {
    return {
      hasAccess: true, // Allow unknown routes to be handled by Next.js (404, etc.)
      routeConfig: null,
    };
  }
  
  const accessCheck = hasRouteAccess(routeConfig, user);
  
  if (!accessCheck.hasAccess) {
    // Determine redirect destination based on the reason
    let redirectTo: string | undefined;
    
    if (accessCheck.reason === "Authentication required") {
      redirectTo = "/sign-in";
    } else if (accessCheck.reason === "Insufficient permissions") {
      const fromUrl = encodeURIComponent(urlPath);
      redirectTo = `/unauthorized?from=${fromUrl}`;
    }
    
    return {
      hasAccess: false,
      routeConfig,
      reason: accessCheck.reason,
      redirectTo,
    };
  }
  
  return {
    hasAccess: true,
    routeConfig,
  };
}

/**
 * Get default redirect URL for authenticated users
 */
export function getDefaultRedirectUrl(user: { role?: Role }): string {
  if (!user.role) return "/onboarding";
  
  switch (user.role) {
    case Role.ADMIN:
    case Role.INSTRUCTOR:
      return "/admin";
    case Role.USER:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

/**
 * Utility functions for common route checks
 */
export const RouteUtils = {
  /**
   * Check if a route is public (no authentication required)
   */
  isPublicRoute(urlPath: string): boolean {
    const routeConfig = findMatchingRoute(urlPath);
    return routeConfig?.access === AccessLevel.PUBLIC;
  },
  
  /**
   * Check if a route requires authentication
   */
  requiresAuth(urlPath: string): boolean {
    const routeConfig = findMatchingRoute(urlPath);
    return routeConfig?.access !== AccessLevel.PUBLIC;
  },
  
  /**
   * Check if a route is admin-only
   */
  isAdminRoute(urlPath: string): boolean {
    const routeConfig = findMatchingRoute(urlPath);
    return routeConfig?.access === AccessLevel.ADMIN;
  },
  
  /**
   * Get all routes accessible to a specific role
   */
  getAccessibleRoutes(role: Role): RouteConfig[] {
    return routeConfigs.filter(config => {
      if (config.access === AccessLevel.PUBLIC) return true;
      if (!config.roles) return false;
      return config.roles.includes(role);
    });
  },
  
  /**
   * Get route configuration by path (exact match)
   */
  getRouteByPath(path: string): RouteConfig | undefined {
    return routeConfigs.find(config => config.path === path);
  },
};

/**
 * Legacy array for backward compatibility
 * @deprecated Use routeConfigs and the new access control functions instead
 */
export const protectedPages: {
  path: string;
  roles: Role[];
}[] = routeConfigs
  .filter(config => config.access === AccessLevel.PROTECTED || config.access === AccessLevel.ADMIN)
  .map(config => ({
    path: config.path,
    roles: config.roles || [],
  }));