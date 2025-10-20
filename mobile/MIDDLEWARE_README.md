# Mobile Middleware System

This document describes the middleware system implemented for the mobile app, which provides authentication and authorization controls similar to the frontend app.

## Overview

The mobile middleware system consists of several key components:

1. **Route Access Control** (`src/lib/AccessPage.ts`) - Defines route permissions and access levels
2. **Authentication Context** (`src/context/AuthContext.tsx`) - Manages user authentication state
3. **Route Guards** (`src/components/RouteGuard.tsx`) - Components for protecting routes
4. **Middleware Hook** (`hooks/useMiddleware.ts`) - Hook for route protection logic
5. **Navigation Utilities** (`src/utils/navigation.ts`) - Type-safe navigation with access control

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App Layout                        │
├─────────────────────────────────────────────────────────────┤
│  QueryClientProvider                                        │
│  └── AuthProvider                                           │
│      └── RouteGuard                                         │
│          └── Stack Navigator                                │
│              └── Screen Components                          │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Route Access Control (`AccessPage.ts`)

Defines the access control system with route configurations:

```typescript
export enum AccessLevel {
  PUBLIC = "public",           // No authentication required
  AUTHENTICATED = "authenticated", // Requires login
  PROTECTED = "protected",     // Requires specific roles
  ADMIN = "admin",            // Admin/Instructor only
}

export enum RouteType {
  EXACT = "exact",            // Exact path match
  DYNAMIC = "dynamic",        // Contains parameters (:param)
  WILDCARD = "wildcard",      // Prefix matching
}
```

### 2. Authentication Context (`AuthContext.tsx`)

Provides authentication state and utilities:

```typescript
const { 
  user, 
  isLoading, 
  isAuthenticated, 
  isNewUser,
  hasRole,
  hasAnyRole,
  signOut,
  refreshUser 
} = useAuthContext();
```

### 3. Route Guards (`RouteGuard.tsx`)

Components for protecting routes:

```typescript
// Require authentication
<RequireAuth>
  <YourComponent />
</RequireAuth>

// Require specific role
<RequireRole role={Role.ADMIN}>
  <AdminComponent />
</RequireRole>

// Require any of multiple roles
<RequireAnyRole roles={[Role.ADMIN, Role.INSTRUCTOR]}>
  <AdminOrInstructorComponent />
</RequireAnyRole>

// Require admin role
<RequireAdmin>
  <AdminComponent />
</RequireAdmin>

// Require user role
<RequireUser>
  <UserComponent />
</RequireUser>

// Handle new user onboarding
<RequireOnboarding>
  <OnboardingComponent />
</RequireOnboarding>

// Guest only (redirects authenticated users)
<RequireGuest>
  <AuthComponent />
</RequireGuest>
```

### 4. Middleware Hook (`useMiddleware.ts`)

Hook for route protection logic:

```typescript
const { hasAccess, isLoading, redirectTo } = useMiddleware();

// Additional utility hooks
const requiresAuth = useRequiresAuth();
const isPublicRoute = useIsPublicRoute();
const isAdminRoute = useIsAdminRoute();
const hasRole = useHasRole(Role.ADMIN);
const hasAnyRole = useHasAnyRole([Role.ADMIN, Role.INSTRUCTOR]);
const accessibleRoutes = useAccessibleRoutes();
const canAccess = useCanAccessRoute('/admin');
```

### 5. Navigation Utilities (`navigation.ts`)

Type-safe navigation with access control:

```typescript
// Navigate with access control
navigateTo('/admin', user, { replace: true });

// Navigate to user's default page
navigateToDefault(user);

// Authentication navigation
AuthNavigation.signIn({ replace: true });
AuthNavigation.signUp();
AuthNavigation.forgotPassword();
AuthNavigation.resetPassword(token);

// User navigation
UserNavigation.dashboard();
UserNavigation.profile();
UserNavigation.tests();
UserNavigation.test(testId);
UserNavigation.analytics();
UserNavigation.leaderboard(testId);

// Admin navigation
AdminNavigation.dashboard();
AdminNavigation.questions();
AdminNavigation.addQuestion();
AdminNavigation.editQuestion(questionId);
AdminNavigation.tests();
AdminNavigation.addTest();
AdminNavigation.bulkUpload();

// Special navigation
SpecialNavigation.onboarding();
SpecialNavigation.unauthorized(fromUrl);
SpecialNavigation.home();

// Utility functions
const canNavigate = canNavigateTo('/admin', user);
const accessibleRoutes = getAccessibleRoutes(user);
navigateBack('/dashboard');
replaceRoute('/sign-in');
pushRoute('/profile');
```

## Usage Examples

### 1. Protecting a Screen Component

```typescript
import { RequireAuth } from '@/src/components/RouteGuard';

export default function DashboardScreen() {
  return (
    <RequireAuth>
      <View>
        <Text>Dashboard Content</Text>
      </View>
    </RequireAuth>
  );
}
```

### 2. Admin-Only Screen

```typescript
import { RequireAdmin } from '@/src/components/RouteGuard';

export default function AdminScreen() {
  return (
    <RequireAdmin>
      <View>
        <Text>Admin Dashboard</Text>
      </View>
    </RequireAdmin>
  );
}
```

### 3. Using Navigation with Access Control

```typescript
import { UserNavigation, canNavigateTo } from '@/src/utils/navigation';
import { useAuthContext } from '@/src/context/AuthContext';

export default function TestListScreen() {
  const { user } = useAuthContext();

  const handleTestPress = (testId: string) => {
    if (canNavigateTo(`/test/${testId}`, user)) {
      UserNavigation.test(testId);
    } else {
      // Handle access denied
      console.log('Access denied to test');
    }
  };

  return (
    <View>
      {/* Test list UI */}
    </View>
  );
}
```

### 4. Custom Route Guard

```typescript
import { RequireAnyRole } from '@/src/components/RouteGuard';
import { Role } from '@repo/db/enums';

export default function InstructorOrAdminScreen() {
  return (
    <RequireAnyRole roles={[Role.INSTRUCTOR, Role.ADMIN]}>
      <View>
        <Text>Instructor or Admin Content</Text>
      </View>
    </RequireAnyRole>
  );
}
```

### 5. Using Middleware Hook

```typescript
import { useMiddleware, useRequiresAuth } from '@/hooks/useMiddleware';

export default function SomeScreen() {
  const { isLoading } = useMiddleware();
  const requiresAuth = useRequiresAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Screen Content</Text>
      {requiresAuth && <Text>This screen requires authentication</Text>}
    </View>
  );
}
```

## Route Configuration

Routes are configured in `src/lib/AccessPage.ts`. To add a new route:

```typescript
export const routeConfigs: RouteConfig[] = [
  // ... existing routes
  {
    path: "/new-route",
    type: RouteType.EXACT,
    access: AccessLevel.PROTECTED,
    roles: [Role.USER, Role.ADMIN],
    description: "New protected route"
  },
];
```

## Access Levels

- **PUBLIC**: No authentication required (sign-in, sign-up, landing page)
- **AUTHENTICATED**: Requires login but no specific role (onboarding, unauthorized)
- **PROTECTED**: Requires specific roles (dashboard, tests, profile)
- **ADMIN**: Admin/Instructor only (admin panel, question management)

## Route Types

- **EXACT**: Exact path match (`/dashboard`)
- **DYNAMIC**: Contains parameters (`/test/:testId`)
- **WILDCARD**: Prefix matching (`/admin/*`)

## Error Handling

The middleware system handles various error scenarios:

1. **Authentication Required**: Redirects to `/sign-in`
2. **Insufficient Permissions**: Redirects to `/unauthorized`
3. **New User**: Redirects to `/onboarding`
4. **Authenticated User on Auth Pages**: Redirects to default page

## Best Practices

1. **Use Route Guards**: Wrap sensitive components with appropriate route guards
2. **Check Access Before Navigation**: Use `canNavigateTo()` before programmatic navigation
3. **Handle Loading States**: Always handle loading states in your components
4. **Provide Fallbacks**: Provide meaningful fallback components for access denied scenarios
5. **Use Type-Safe Navigation**: Use the navigation utilities instead of direct router calls

## Integration with Existing Code

The middleware system integrates seamlessly with:

- **Expo Router**: Uses `expo-router` for navigation
- **React Query**: Integrates with existing query client
- **Authentication Hooks**: Uses existing `useAuth` hooks
- **API Configuration**: Uses existing API configuration

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check route configurations for circular dependencies
2. **Access Denied**: Verify user roles and route permissions
3. **Loading States**: Ensure proper loading state handling
4. **Navigation Errors**: Use type-safe navigation utilities

### Debug Mode

Enable debug logging by setting `__DEV__` to true in development mode. The middleware will log access control decisions and navigation attempts.

## Migration from Frontend

The mobile middleware system mirrors the frontend system but is adapted for React Native:

- Uses `expo-router` instead of Next.js router
- Uses React Native components instead of web components
- Handles mobile-specific navigation patterns
- Integrates with React Native authentication patterns

This ensures consistency between web and mobile applications while respecting platform-specific requirements.
