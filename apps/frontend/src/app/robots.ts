import { MetadataRoute } from 'next';

const BASE_URL = 'https://rankmarg.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/_next/', '/static/', '/dashboard/', '/test/', '/onboarding/', '/payment/', '/subscription/', '/settings/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
