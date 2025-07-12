import { SubscriptionStatus } from '@prisma/client';
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username?: string;
    createdAt?: Date; 
    stream?: string;
    role?: 'ADMIN' | 'USER' | 'INSTRUCTOR';
    isNewUser?: boolean;
    plan?: UserPlan;
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      username?: string;
      createdAt?: Date;
      stream?: string;
      role?: 'ADMIN' | 'USER' | 'INSTRUCTOR';
      isNewUser?: boolean;
      plan?: UserPlan;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    createdAt?: Date;
    stream?: string;
    role?: 'ADMIN' | 'USER' | 'INSTRUCTOR';
    isNewUser?: boolean;
    plan?: UserPlan;
  }
}

interface UserPlan {
  id?: string;
  status: SubscriptionStatus;
  endAt: Date;
}
