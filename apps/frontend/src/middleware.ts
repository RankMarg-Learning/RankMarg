import { NextRequest, NextResponse } from "next/server";

const PUBLIC_STATIC_ROUTES = ["/_next", "/static", "/images", "/favicon.ico"];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("x-auth-token");
    const path = request.nextUrl.pathname;
    
      if (PUBLIC_STATIC_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
    if (path === "/" || path === "/sign-in" || path === "/sign-up") {
    if (token) {
    //   if (decodedToken.isNewUser) {
    //     return NextResponse.redirect(new URL('/onboarding', request.url));
    //   } else {
    //     const redirectUrl = token.role === Role.USER ? '/dashboard' : '/admin';
    //     return NextResponse.redirect(new URL(redirectUrl, request.url));
    //   }
    }
    return NextResponse.next();
  }
    
    return NextResponse.next();
}