import { Metadata } from "next";
import SignUpForm from "../../../components/auth/SignUpForm";


export const metadata: Metadata = {
  title: "Sign Up | RankMarg – Start Your Personalized JEE & NEET Practice",
  description:
    "Join RankMarg today and kickstart your personalized JEE/NEET preparation. Get smart practice sessions, AI-powered insights, and mastery tracking to boost your rank.",
  keywords: [
    "RankMarg Sign Up",
    "Register JEE Preparation",
    "NEET Practice Registration",
    "Join RankMarg",
    "JEE NEET Adaptive Practice",
    "Free Sign Up JEE NEET",
    "Personalized Exam Preparation",
    "RankMarg Student Registration"
  ],
  openGraph: {
    title: "Sign Up | RankMarg – Start Your Personalized JEE & NEET Practice",
    description:
      "Create your free RankMarg account and unlock AI-powered practice, smart mock tests, and adaptive learning designed to help you crack JEE & NEET.",
    url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/sign-up`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/Logo.svg`,
        width: 1200,
        height: 630,
        alt: "RankMarg Sign Up – Personalized JEE & NEET Practice Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | RankMarg – Start Your Personalized JEE & NEET Practice",
    description:
      "Join thousands of JEE/NEET aspirants on RankMarg. Sign up to access adaptive practice, mastery tracking, and motivational learning journeys.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL),
};

export default function SignUpPage() {
  return <SignUpForm />;
}