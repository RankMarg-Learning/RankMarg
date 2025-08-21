/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const nextConfig = {
    // Required to produce .next/standalone used by the Docker runtime image
    output: 'standalone',
    reactStrictMode: true,
    transpilePackages: ["@repo/db", "@repo/suggest"],
    images: {
        domains: [
            "lh3.googleusercontent.com",
            "cdn.rareblocks.xyz",
            "utfs.io",
            "res.cloudinary.com"
        ],
    },
};

export default nextConfig;
