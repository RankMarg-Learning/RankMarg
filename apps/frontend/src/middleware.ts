import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Role } from '@repo/db/enums';
import { 
  checkRouteAccess, 
  getDefaultRedirectUrl
} from './lib/AccessPage';

interface User {
  id: string;
  plan?:{
    id?: string | null;
    status?: string;
    endAt?: Date | null;
  };
  examCode?: string;
  role?: Role;
  isNewUser?: boolean;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as User;
  } catch (error) {
    return null;
  }
}

async function getUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('x-auth-token')?.value;
  if (!token) {
    return null;
  }
  const payload = await verifyToken(token);
  return payload;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const user = await getUser(request);

  // Handle root and auth pages with special redirect logic
  if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up") {
    if (user) {
      // Redirect authenticated users to their default page
      const redirectUrl = getDefaultRedirectUrl(user);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Allow unauthenticated users to access these pages
    return NextResponse.next();
  }

  // Handle new user onboarding flow
  if (user && user.isNewUser) {
    // New users must complete onboarding first
    if (pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    // Allow access to onboarding page
    return NextResponse.next();
  }

  // Check route access using the new system
  const accessResult = checkRouteAccess(pathname, user);

  // If access is denied and we have a redirect destination
  if (!accessResult.hasAccess && accessResult.redirectTo) {
    return NextResponse.redirect(new URL(accessResult.redirectTo, request.url));
  }

  // If access is denied but no specific redirect (shouldn't happen with our system)
  if (!accessResult.hasAccess) {
    // Fallback redirect based on authentication status
    const fallbackUrl = user ? '/unauthorized' : '/sign-in';
    return NextResponse.redirect(new URL(fallbackUrl, request.url));
  }

  // Access granted or unknown route (let Next.js handle 404s)
  return NextResponse.next();
}