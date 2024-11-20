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
    },
    experimental: {
      appDir: true,
    },
};

export default nextConfig;
