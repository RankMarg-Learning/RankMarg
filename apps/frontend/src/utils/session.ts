import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

const sessionCache = new Map<string, { data: any, expires: number }>();

export async function getAuthSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('next-auth.session-token') || 
                     cookieStore.get('__Secure-next-auth.session-token') ||
                     cookieStore.get('__Host-next-auth.session-token');
        
        if (!token?.value) {
            console.log('🔍 No JWT token found in cookies');
            return null;
        }
        const cacheKey = `session-${token.value.substring(0, 20)}`;
        const cached = sessionCache.get(cacheKey);
        
        if (cached && cached.expires > Date.now()) {
            console.log('🔍 Using cached session data');
            return cached.data;
        }
        const session = await getServerSession(authOptions);
        
        if (session?.user?.id) {
            sessionCache.set(cacheKey, {
                data: session,
                expires: Date.now() + 30000 // 30 seconds
            });
            
            return session;
        } else {
            console.log('🔍 No valid session found');
            return null;
        }
        
    } catch (error) {
        console.error('🔍 Session auth error:', error);
        return null;
    }
}