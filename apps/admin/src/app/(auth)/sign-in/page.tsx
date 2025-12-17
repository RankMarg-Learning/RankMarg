import { Metadata } from "next";
import SignInForm from "../../../components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | RankMarg – Personalized Practice for JEE & NEET",
  description:
    "Sign in to RankMarg and continue your personalized JEE/NEET preparation journey. Access smart practice sessions, mastery tracking, and AI-powered insights.",
  keywords: [
    "RankMarg Login",
    "Sign In JEE Preparation",
    "NEET Practice Login",
    "JEE NEET Mock Test Access",
    "RankMarg Student Login",
    "Personalized Exam Practice",
    "Adaptive Learning Platform"
  ],
  openGraph: {
    title: "Sign In | RankMarg – Administrator Panel",
    description:
      "Log in to RankMarg administrator panel and manage your content, users, and settings.",
    url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/sign-in`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png", 
        width: 1200,
        height: 630,
        alt: "RankMarg Administrator Sign In – Administrator Panel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | RankMarg – Administrator Panel",
    description:
      "Log in to RankMarg administrator panel and manage your content, users, and settings.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL),
};

export default function SignInPage() {
  return <SignInForm />;
}