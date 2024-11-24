/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ["lh3.googleusercontent.com","cdn.rareblocks.xyz","utfs.io"],
      },
    env:{
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
    }
};

export default nextConfig;
