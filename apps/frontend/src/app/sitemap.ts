import { MetadataRoute } from 'next';

const BASE_URL = 'https://rankmarg.in';
const ARTICLES_API_URL = 'https://article.rankmarg.in/api/v1/articles';
const API_KEY = process.env.NEXT_PUBLIC_ARTICLE_API_KEY || 'Bearer rankmarg';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = [
        '',
        '/get-started',
        '/pricing',
        '/about-us',
        '/contact-us',
        '/faqs',
        '/help-support',
        '/privacy-policy',
        '/refunds',
        '/terms',
        '/articles',
        '/sign-in',
        '/sign-up',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        const response = await fetch(ARTICLES_API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': API_KEY,
            },
            next: { revalidate: 3600 },
        });

        if (response.ok) {
            const data = await response.json();
            const articles = data.data || [];

            const articleRoutes = articles.map((article: any) => ({
                url: `${BASE_URL}/articles/${article.slug}`,
                lastModified: new Date(article.updatedAt || article.createdAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));

            return [...routes, ...articleRoutes];
        }
    } catch (error) {
        console.error('Error fetching articles for sitemap:', error);
    }

    return routes;
}
