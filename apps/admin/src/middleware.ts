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
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/_not-found') ||
    pathname.startsWith('/_error')
  ) {
    return NextResponse.next();
  }

  const user = await getUser(request);

  if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up") {
    if (user) {
      const redirectUrl = getDefaultRedirectUrl(user);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (user && user.isNewUser && user.role !== Role.ADMIN && user.role !== Role.INSTRUCTOR) {
    if (pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  const accessResult = checkRouteAccess(pathname, user);

  if (!accessResult.hasAccess && accessResult.redirectTo) {
    return NextResponse.redirect(new URL(accessResult.redirectTo, request.url));
  }

  if (!accessResult.hasAccess) {
    const fallbackUrl = user ? '/unauthorized' : '/sign-in';
    return NextResponse.redirect(new URL(fallbackUrl, request.url));
  }

  return NextResponse.next();
}