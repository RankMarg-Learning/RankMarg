import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";
import { Method, protectedApiRoutes, protectedPages } from "./lib/auth-routes";
import { Role } from "@repo/db/enums";

function matchRoute(url: string, pattern: string): boolean {
  const urlSegments = url.split("?")[0].split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);
  
  if (urlSegments.length !== patternSegments.length) return false;
  
  return patternSegments.every((segment, index) =>
    segment.startsWith(":") || segment === urlSegments[index]
  );
}

const PUBLIC_STATIC_ROUTES = ["/_next", "/static", "/images", "/favicon.ico"];
const PUBLIC_API_ENDPOINTS = ["/api/users", "/api/auth", "/api/check-username"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request as unknown as NextApiRequest });
  
  const method = request.method;
  const url = request.nextUrl.pathname;

  if (PUBLIC_STATIC_ROUTES.some(route => url.startsWith(route))) {
    return NextResponse.next();
  }

  if (url === "/" || url === "/sign-in" || url === "/sign-up") {
    if (token) {
      if (token.isNewUser) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      } else {
        const redirectUrl = token.role === Role.USER ? '/dashboard' : '/admin';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  if (url.startsWith("/api")) {
    if (method === "POST" && PUBLIC_API_ENDPOINTS.includes(url)) {
      return NextResponse.next();
    }

    for (const [route, accessRules] of Object.entries(protectedApiRoutes)) {
      if (matchRoute(url, route)) {
        if (!token) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }
        
        const allowed = accessRules.some(rule =>
          (rule.methods?.includes(method as Method) || rule.methods?.includes("ALL")) &&
          rule.role.includes(token.role as Role)
        );
        
        if (!allowed) {
          return new NextResponse("Unauthorized", { status: 403 });
        }
      }
    }
    return NextResponse.next();
  }

  const matchedPage = protectedPages.find(({ path }) => matchRoute(url, path));
  
  if (matchedPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    if (!matchedPage.roles.includes(token.role)) {
      const fromUrl = encodeURIComponent(url);
      return NextResponse.redirect(new URL(`/unauthorized?from=${fromUrl}`, request.url));
    }
  }
  
  if (token) {
    if (token.isNewUser && url !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    
    if (!token.isNewUser && url === '/onboarding') {
      const redirectUrl = token.role === Role.USER ? '/dashboard' : '/admin';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

