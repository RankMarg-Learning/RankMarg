/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    transpilePackages: ["@repo/db", "@repo/common-ui"],
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            'framer-motion',
            'date-fns',
            'react-hook-form',
            'zod'
        ],
    },
    webpack: (config, { dev, isServer }) => {
        // Only apply these optimizations in production
        if (!dev) {
            config.optimization = {
                ...config.optimization,
                usedExports: true,
                sideEffects: false,
            };
        }
        return config;
    },
    images: {
        domains: [
            "lh3.googleusercontent.com",
            "cdn.rareblocks.xyz",
            "utfs.io",
            "res.cloudinary.com",
            "cdn.rankmarg.in"
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    compress: true,
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
