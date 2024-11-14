import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request as unknown as NextApiRequest});
    
    const url = request.nextUrl;

    if (!token) {
        return NextResponse.rewrite(new URL('/sign-in', request.url));
    }

    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up')
    )) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if(!token && url.pathname.startsWith('/challenge')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/sign-in', '/question/:path*', '/question/:questionId', '/challenge'],
};
