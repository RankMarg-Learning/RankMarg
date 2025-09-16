import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { Role } from '@repo/db/enums';
import { protectedPages } from './lib/auth-routes';

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

const PUBLIC_STATIC_ROUTES = ["/_next", "/static", "/images", "/favicon.ico"];

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

function matchesRoute(url: string, pattern: string): boolean {
  const urlSegments = url.split("?")[0].split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);
  
  if (urlSegments.length !== patternSegments.length) return false;
  
  return patternSegments.every((segment, index) =>
    segment.startsWith(":") || segment === urlSegments[index]
  );
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

  const isPublicRoute = matchesRoute(pathname, PUBLIC_STATIC_ROUTES.join("/"));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const user = await getUser(request);

  if(pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up") {
    if(user) {
      const redirectUrl = user.role === Role.USER ? '/dashboard' : '/admin';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  const matchedPage = protectedPages.find(({ path }) => matchesRoute(pathname, path));

  if (matchedPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    if (!matchedPage.roles.includes(user.role)) {
      const fromUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/unauthorized?from=${fromUrl}`, request.url));
    }
  }

  if (user && pathname !== "/onboarding") {
    if (user.isNewUser && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }else{
    const redirectUrl = user.role === Role.USER ? '/dashboard' : '/admin';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
   
  return NextResponse.next();
}