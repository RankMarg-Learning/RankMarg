import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";



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
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing username or password");
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.email }, { username: credentials.email }],
          },
        });

        if (!user) {
          console.log("User not found");
          return null;
        }

        const passwordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordCorrect) {
          console.log("Password incorrect");
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
      try {
        if (!user.email) {
          console.log("User email is not available");
          return false;
        }
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          console.log("User does not exist");
          const emailPrefix = user.email.split('@')[0];
          await prisma.user.create({
            data: {
              name: user.name!,
              username: await generateUniqueUsername(emailPrefix),
              email: user.email!,
              avatar: user.image,
              provider: 'google',
            },
          });
          return true;

        } else {
          console.log("User already exists");
        }
        return true;

      } catch (error) {
        console.log(error);
        return false;
      }
    },


    async jwt({ token, user, trigger, session }) {
      if (user) {
        const userData = await prisma.user.findUnique({
          where: { email: user.email },
        });
        token.id = userData.id.toString();
        token.username = user.username;
        token.email = user.email
        token.image = user.image
        token.role = userData.role || 'USER'
        token.stream = userData.stream || ""
        token.accessToken = user.accessToken
        token.isNewUser = !userData || userData.onboardingCompleted !== true;

      }
      if (trigger === "update" && session?.isNewUser !== undefined) {
        token.isNewUser = session.isNewUser;
      }
      if (token.email) {
        const refreshedUserData = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (refreshedUserData) {
          token.isNewUser = !refreshedUserData.onboardingCompleted;
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.stream = token.stream;
        session.user.accessToken = token.accessToken;
        session.user.isNewUser = token.isNewUser || false;
      }

      const userData = await prisma.user.findUnique({
        where: { email: session.user.email! },
      });
      if (userData) {
        session.user.id = userData.id.toString();
        session.user.name = userData.name;
        session.user.username = userData.username || session.user.username;
        session.user.image = userData.avatar || session.user.image;
        session.user.stream = userData.stream || session.user.stream;
        session.user.createdAt = userData.createdAt;
        session.user.role = userData.role;
        session.user.isNewUser = !userData || userData.onboardingCompleted !== true;
        session.user.accessToken = jwt.sign({ id: userData.id, username: userData.username ,stream:userData.stream,}, process.env.NEXTAUTH_SECRET)
      }
      return session
    },

  },
  pages: {
    signIn: '/sign-in',

  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,

}