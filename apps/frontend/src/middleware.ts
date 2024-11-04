import {NextRequest, NextResponse } from "next/server";

export {default} from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request:NextRequest){


    const token = await getToken({req:request as any});
    
    const url = request.nextUrl;

    if(!token){
        return NextResponse.rewrite(new URL('/sign-in', request.url))
    }
    
    
    if(token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up')
    
    )){
        return NextResponse.rewrite(new URL('/', request.url))
    }
    
    
    return NextResponse.next();

}

export const config = {
    matcher: ['/sign-in', '/sign-up','/','/question/:path*',
        '/question/:questionId',
        '/challenge'
    ], //!'/problems/:path*' use this if you want to match all routes starting with /problems

    
}