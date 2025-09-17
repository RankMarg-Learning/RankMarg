// Quick test to verify the access control system
import { Role } from '@repo/db/enums';
import { 
  checkRouteAccess, 
  findMatchingRoute, 
  matchesRoute,
  RouteType,
  AccessLevel 
} from '../src/lib/AccessPage.ts';

console.log('Testing Access Control System...\n');

// Test route matching
console.log('=== Route Matching Tests ===');
console.log('Exact match ("/dashboard"):', matchesRoute('/dashboard', '/dashboard', RouteType.EXACT));
console.log('Dynamic match ("/test/123"):', matchesRoute('/test/123', '/test/:testId', RouteType.DYNAMIC));
console.log('Dynamic mismatch ("/test"):', matchesRoute('/test', '/test/:testId', RouteType.DYNAMIC));

// Test route finding
console.log('\n=== Route Finding Tests ===');
const dashboardRoute = findMatchingRoute('/dashboard');
console.log('Dashboard route found:', dashboardRoute?.path, dashboardRoute?.access);

const testRoute = findMatchingRoute('/test/abc123');
console.log('Test route found:', testRoute?.path, testRoute?.access);

const adminRoute = findMatchingRoute('/admin/questions');
console.log('Admin route found:', adminRoute?.path, adminRoute?.access);

// Test access control
console.log('\n=== Access Control Tests ===');

// Public route test
const publicAccess = checkRouteAccess('/pricing', null);
console.log('Public route access (no user):', publicAccess.hasAccess);

// Protected route test (no user)
const protectedNoUser = checkRouteAccess('/dashboard', null);
console.log('Protected route access (no user):', protectedNoUser.hasAccess, '- Redirect to:', protectedNoUser.redirectTo);

// Protected route test (with user)
const userWithRole = { role: Role.USER };
const protectedWithUser = checkRouteAccess('/dashboard', userWithRole);
console.log('Protected route access (USER role):', protectedWithUser.hasAccess);

// Admin route test (user role)
const adminNoAccess = checkRouteAccess('/admin/questions', userWithRole);
console.log('Admin route access (USER role):', adminNoAccess.hasAccess, '- Redirect to:', adminNoAccess.redirectTo);

// Admin route test (admin role)
const adminWithRole = { role: Role.ADMIN };
const adminAccess = checkRouteAccess('/admin/questions', adminWithRole);
console.log('Admin route access (ADMIN role):', adminAccess.hasAccess);

console.log('\n=== All tests completed ===');
