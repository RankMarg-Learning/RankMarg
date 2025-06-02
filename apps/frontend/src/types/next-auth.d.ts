import 'next-auth'
import { DefaultSession } from 'next-auth'


 
declare module 'next-auth' {
    interface User {
        id: string
        username?: string
        createdAt?: string
        stream?: string
        role?: "ADMIN" | "USER" | "INSTRUCTOR"
        accessToken?: string
        isNewUser?: boolean
        
    }
    interface Session {
        user: {
            id: string
            username?: string
            createdAt?: DateTime
            stream?: string
            role?: "ADMIN" | "USER" | "INSTRUCTOR"
            accessToken?: string
            isNewUser?: boolean
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username?: string
        createdAt?: string
        role?: "ADMIN" | "USER" | "INSTRUCTOR"
        stream?: string
        accessToken?: string
        isNewUser?: boolean
    }
}