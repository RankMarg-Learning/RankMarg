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
    title: "Sign In | RankMarg – Personalized Practice for JEE & NEET",
    description:
      "Log in to RankMarg and unlock personalized practice sessions, dynamic mock tests, and performance insights designed to boost your JEE/NEET rank.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sign-in`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/Logo.svg`,
        width: 1200,
        height: 630,
        alt: "RankMarg Student Sign In – Personalized JEE & NEET Practice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | RankMarg – Personalized Practice for JEE & NEET",
    description:
      "Continue your JEE/NEET preparation with RankMarg. Sign in to access AI-powered practice, mastery tracking, and adaptive learning.",
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