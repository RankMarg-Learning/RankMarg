import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request as unknown as NextApiRequest});
    const url = request.nextUrl;


    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') 
    )) {
        return NextResponse.redirect(new URL('/tests', request.url));
    }
    
    if(token && token.Role === 'USER' && url.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/tests', request.url));
    }

    const test = url.pathname.match(/^\/test\/([^/]+)\/instructions$/) || url.pathname.match(/^\/test\/([^/]+)\$/);

    if(!token && ( url.pathname.startsWith('/challenge') || url.pathname.startsWith('/tests') || test )) {

        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/sign-in','/sign-up', '/question/:path*', '/question/:questionId', '/challenge','/admin/:path*','/test/:testId','/test/:testId/:path*','/tests'],
};
