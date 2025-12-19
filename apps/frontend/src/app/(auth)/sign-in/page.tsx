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
    title: "Sign In | RankMarg – Your Personal AI Coach for JEE & NEET ",
    description:
      "Log in to RankMarg and continue your personalized JEE/NEET preparation journey. Access smart practice sessions, mastery tracking, and AI-powered insights.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sign-in`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png", 
        width: 1200,
        height: 630,
        alt: "RankMarg Student Sign In – Your Personal AI Coach for JEE & NEET ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | RankMarg – Your Personal AI Coach for JEE & NEET ",
    description:
      "Log in to RankMarg and continue your personalized JEE/NEET preparation journey. Access smart practice sessions, mastery tracking, and AI-powered insights.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL),
};

export default function SignInPage() {
  return <SignInForm />;
}