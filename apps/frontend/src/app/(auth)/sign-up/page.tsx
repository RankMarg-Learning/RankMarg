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
    title: "Sign Up | RankMarg – Your Personal AI Practice Coach for JEE & NEET ",
    description:
      "Create your free RankMarg account and continue your personalized JEE/NEET preparation journey. Access smart practice sessions, mastery tracking, and AI-powered insights.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sign-up`,
    type: "website",
    siteName: "RankMarg",
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png",
        width: 1200,
        height: 630,
        alt: "RankMarg Sign Up – Your Personal AI Practice Coach for JEE & NEET ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | RankMarg – Your Personal AI Practice Coach for JEE & NEET ",
    description:
      "Create your free RankMarg account and continue your personalized JEE/NEET preparation journey. Access smart practice sessions, mastery tracking, and AI-powered insights.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL),
};

export default function SignUpPage() {
  return <SignUpForm />;
}