import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";
import { Role, SubscriptionStatus } from "@repo/db/enums";

const getUserWithSubscription = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
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
      },
    },
  });
};

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
          where: {
            OR: [{ email }, { username: email }],
          },
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
          },
        });
        await prisma.subscription.create({
          data: {
            user: { connect: { id: user.id } },
            status: "TRIAL",
            provider:"NONE",
            duration: 30,
            amount: 0,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          },
        })
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const email = user?.email ?? token.email;

      if (email) {
        const userData = await getUserWithSubscription(email);
        if (userData) {
          token.id = userData.id;
          token.username = userData.username;
          token.email = userData.email;
          token.image = userData.avatar;
          token.role = userData.role as Role;
          token.examCode = userData.examRegistrations[0]?.exam.code ?? "";
          token.isNewUser = !userData.onboardingCompleted;
          token.plan = {
            id: userData.subscription?.planId ?? null,
            status: userData.subscription?.status as SubscriptionStatus,
            endAt: userData.subscription?.currentPeriodEnd ?? null,
          };
        }
      }

      if (trigger === "update" && session?.isNewUser !== undefined) {
        token.isNewUser = session.isNewUser;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.email) return session;

      const userData = await getUserWithSubscription(token.email);

      if (userData) {
        session.user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username ?? "",
          image: userData.avatar ?? "",
          role: userData.role as Role,
          examCode: userData.examRegistrations[0]?.exam.code ?? "",
          createdAt: userData.createdAt,
          isNewUser: !userData.onboardingCompleted,
          plan: {
            id: userData.subscription?.planId ?? null,
            status: userData.subscription?.status as SubscriptionStatus,
            endAt: userData.subscription?.currentPeriodEnd ?? null,
          },
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 10, 
    updateAge: 60 * 60 * 2,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 10, 
  },

  secret: process.env.NEXTAUTH_SECRET,
};
