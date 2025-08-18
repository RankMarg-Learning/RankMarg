/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@repo/db", "@repo/suggest", "@repo/common-utils"],
    images: {
        domains: ["lh3.googleusercontent.com","cdn.rareblocks.xyz","utfs.io","res.cloudinary.com"],
      },
    env:{
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_JWT_SECRET: process.env.NEXTAUTH_JWT_SECRET,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET,
      ADMIN_API_KEY:process.env.ADMIN_API_KEY,
      RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    }
};

export default nextConfig;
