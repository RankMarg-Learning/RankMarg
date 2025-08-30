import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";
import { Role, SubscriptionStatus } from "@repo/db/enums";
import { SUBSCRIPTION_CONFIG } from "@/config/subscription.config";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  avatar: string | null;
  role: Role;
  onboardingCompleted: boolean;
  createdAt: Date;
  subscription?: {
    planId: string | null;
    status: string;
    currentPeriodEnd: Date | null;
  } | null;
  examRegistrations: Array<{
    exam: {
      code: string;
    };
  }>;
}

const JWT_MAX_AGE = 60 * 60 * 24 * 10;
const SESSION_UPDATE_AGE = 60 * 60 * 2;

const userSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  avatar: true,
  role: true,
  onboardingCompleted: true,
  createdAt: true,
  subscription: {
    select: {
      planId: true,
      status: true,
      currentPeriodEnd: true,
    },
  },
  examRegistrations: {
    select: {
      exam: {
        select: {
          code: true,
        },
      },
    },
    take: 1, 
  },
} as const;

const getUserData = async (email: string): Promise<UserData | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: userSelect,
  }) as Promise<UserData | null>;
};

const createTrialSubscription = () => ({
  status: "TRIAL" as const,
  provider: "NONE" as const,
  duration: SUBSCRIPTION_CONFIG.trial.duration,
  amount: 0,
  currentPeriodEnd: new Date(Date.now() + SUBSCRIPTION_CONFIG.trial.duration * 24 * 60 * 60 * 1000),
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ email }, { username: email }] },
          select: { id: true, email: true, username: true, avatar: true, password: true },
        });

        if (!user || !await bcrypt.compare(password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          image: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });

      if (!existingUser) {
        const emailPrefix = user.email.split("@")[0];
        await prisma.user.create({
          data: {
            name: user.name ?? "",
            username: await generateUniqueUsername(emailPrefix),
            email: user.email,
            avatar: user.image ?? null,
            provider: "google",
            subscription: { create: createTrialSubscription() },
          },
        });
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const email = user?.email ?? token.email;
      
      if (email) {
        if (!token.id || trigger === "update") {
          const userData = await getUserData(email);
          if (userData) {
            Object.assign(token, {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              image: userData.avatar,
              role: userData.role as Role,
              examCode: userData.examRegistrations[0]?.exam.code ?? "",
              isNewUser: !userData.onboardingCompleted,
              plan: {
                id: userData.subscription?.planId ?? null,
                status: userData.subscription?.status as SubscriptionStatus,
                endAt: userData.subscription?.currentPeriodEnd ?? null,
              },
            });
          }
        }
      }

      if (trigger === "update" && session?.isNewUser !== undefined) {
        token.isNewUser = session.isNewUser;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.email) return session;
      
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        username: token.username as string,
        image: token.image as string,
        role: token.role as Role,
        examCode: token.examCode as string,
        createdAt: token.createdAt as Date,
        isNewUser: token.isNewUser as boolean,
        plan: token.plan as {
          id: string | null;
          status: SubscriptionStatus;
          endAt: Date | null;
        },
      };

      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: JWT_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },

  jwt: {
    maxAge: JWT_MAX_AGE,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
