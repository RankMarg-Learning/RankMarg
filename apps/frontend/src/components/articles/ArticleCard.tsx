"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Badge } from "@repo/common-ui";
import { Article } from "@/types/article.types";
import { ArrowRight } from "lucide-react";
import { TextFormator } from "@/utils/textFormator";
import { click_article } from "@/utils/analytics";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
 

  const handleArticleClick = () => {
    click_article(article.id, article.slug, article.title, featured ? 'featured' : 'grid');
  };

  return (
    <Link href={`/articles/${article.slug}`} onClick={handleArticleClick}>
      <Card
        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-primary-300 bg-white ${
          featured
            ? "md:col-span-2 lg:col-span-2"
            : "h-full flex flex-col"
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            featured ? "aspect-[21/9]" : "aspect-video"
          }`}
        >
          {article.thumbnail ? (
            <Image
              src={
                article.thumbnail ||
                "https://cdn.rankmarg.in/assets/article-placeholder.jpg"
              }
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          ) : (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: "radial-gradient(120% 100% at 0% 0%, #f5c400 0%, #d1a800 35%, #6b6f3f 65%, #2e3b40 100%)"
              }}
            >
              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 md:p-6 z-10">
                {/* Category Badge */}
                {article.category && (
                  <div className="mb-2 sm:mb-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-2 py-1 text-xs sm:text-sm font-medium">
                      {TextFormator(article.category)}
                    </Badge>
                  </div>
                )}
                
                {/* Title */}
                <h3 className={`font-bold text-white drop-shadow-lg line-clamp-2 leading-tight ${
                  featured 
                    ? "text-lg sm:text-xl md:text-2xl" 
                    : "text-base sm:text-lg"
                }`}>
                  {article.title}
                </h3>
              </div>
            </div>
          )}
          {/* Gradient overlay - only show on thumbnail images */}
          {article.thumbnail && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}
        </div>

        <div className={`p-4 sm:p-5 md:p-6 ${featured ? "" : "flex-1 flex flex-col"}`}>
          {/* Meta information */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {article.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs border-gray-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    {TextFormator(tag.name)}
                  </Badge>
                ))}
                {article.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{article.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 sm:mb-3 line-clamp-2 leading-tight ${
              featured 
                ? "text-xl sm:text-2xl md:text-3xl" 
                : "text-lg sm:text-xl md:text-2xl"
            }`}
          >
            {article.title}
          </h3>

          {/* Description */}
          {article.seo.metaDesc && (
            <p className={`text-gray-600 mb-4 sm:mb-5 leading-relaxed ${
              featured 
                ? "line-clamp-3 text-sm sm:text-base" 
                : "line-clamp-2 text-sm"
            }`}>
              {article.seo.metaDesc}
            </p>
          )}

          {/* Read more link */}
          <div className="mt-auto flex items-center gap-2 text-sm text-primary-600 font-semibold group-hover:gap-3 transition-all">
            <span>Read article</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
