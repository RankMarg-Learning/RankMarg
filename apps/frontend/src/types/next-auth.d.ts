import 'next-auth'
import { DefaultSession } from 'next-auth'


 
declare module 'next-auth' {
    interface User {
        id: string
        username?: string
        createdAt?: string
        stream?: string
        Role?: "ADMIN" | "USER" | "INSTRUCTOR"
        accessToken?: string
        
    }
    interface Session {
        user: {
            id: string
            username?: string
            createdAt?: DateTime
            stream?: string
            Role?: "ADMIN" | "USER" | "INSTRUCTOR"
            accessToken?: string
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username?: string
        createdAt?: string
        Role?: "ADMIN" | "USER" | "INSTRUCTOR"
        stream?: string
        accessToken?: string
    }
}