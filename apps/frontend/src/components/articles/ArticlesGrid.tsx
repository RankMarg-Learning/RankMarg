"use client";

import { Article } from "@/types/article.types";
import ArticleCard from "./ArticleCard";
import { Skeleton } from "@repo/common-ui";

interface ArticlesGridProps {
  articles: Article[];
  isLoading?: boolean;
}

export default function ArticlesGrid({
  articles,
  isLoading = false,
}: ArticlesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-base sm:text-lg">
          No articles found. Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          featured={false}
        />
      ))}
    </div>
  );
}
