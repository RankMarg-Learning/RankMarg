import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

// Re-export the default middleware from next-auth
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
    // Get the token
    const token = await getToken({ req: request as unknown as NextApiRequest});

    const url = request.nextUrl;

    // Redirect to sign-in page if no token is found
    if (!token) {
        return NextResponse.rewrite(new URL('/sign-in', request.url));
    }

    // Redirect to home page if the user is already authenticated and tries to access sign-in or sign-up
    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up')
    )) {
        return NextResponse.rewrite(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/sign-in', '/question/:path*', '/question/:questionId', '/challenge'],
};
