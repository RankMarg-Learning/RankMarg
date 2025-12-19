import { Metadata } from "next";
import ArticleDetailContent from "@/components/articles/ArticleDetailContent";

// Server-side function to fetch article for metadata
// Direct API call from server (no CORS issues)
async function fetchArticleBySlug(slug: string) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_ARTICLE_API_KEY || "Bearer rankmarg";
    const response = await fetch(
      `https://article.rankmarg.in/api/v1/articles/${slug}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": API_KEY,
        },
        // Cache for 10 minutes
        next: { revalidate: 600 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const article = await response.json();
    return article;
  } catch (error) {
    console.error("Error fetching article for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article | RankMarg",
      description: "Read expert articles and insights on RankMarg",
    };
  }

  return {
    title: article.seo?.metaTitle || `${article.title} | RankMarg`,
    description: article.seo?.metaDesc || article.title,
    openGraph: {
      title: article.seo?.metaTitle || article.title,
      description: article.seo?.metaDesc || article.title,
      images: article.seo?.ogImage
        ? [article.seo.ogImage]
        : article.seo?.metaImage
        ? [article.seo.metaImage]
        : article.thumbnail
        ? [article.thumbnail]
        : ["https://cdn.rankmarg.in/assets/og-cover.png"],
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo?.metaTitle || article.title,
      description: article.seo?.metaDesc || article.title,
      images: article.seo?.ogImage
        ? [article.seo.ogImage]
        : article.seo?.metaImage
        ? [article.seo.metaImage]
        : article.thumbnail
        ? [article.thumbnail]
        : [],
    },
    robots: article.seo?.robots || undefined,
  };
}

export default function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ArticleDetailContent slug={params.slug} />;
}
