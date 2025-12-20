"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button } from "@repo/common-ui";
import { Article } from "@/types/article.types";
import { Calendar, ArrowLeft, BookOpen, Tag, Share2, Hash, X } from "lucide-react";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { Skeleton } from "@repo/common-ui";
import { TextFormator } from "@/utils/textFormator";
import { getCategoryGradient, getCategoryBorderColor } from "@/utils/getCategoryGradient";
import { useEffect, useState, useMemo } from "react";
import { view_article_detail, share_article, click_related_article } from "@/utils/analytics";

// Use Next.js API routes to avoid CORS issues
async function fetchArticleBySlug(slug: string): Promise<Article> {
  const { data } = await axios.get<Article>(
    `/api/articles/${slug}`
  );
  return data;
}

async function fetchRelatedArticles(
  category?: string,
  excludeSlug?: string
): Promise<Article[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("limit", "3");
  queryParams.append("isPublished", "true");
  if (category) queryParams.append("category", category);

  const { data } = await axios.get<{ data: Article[] }>(
    `/api/articles?${queryParams.toString()}`
  );

  return data.data.filter((article) => article.slug !== excludeSlug).slice(0, 3);
}

interface ArticleDetailContentProps {
  slug: string;
}

export default function ArticleDetailContent({ slug }: ArticleDetailContentProps) {
  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ["relatedArticles", article?.category, slug],
    queryFn: () =>
      fetchRelatedArticles(article?.category as string || undefined, slug),
    enabled: !!article,
  });

  // Extract headings from markdown content for timeline
  const headings = useMemo(() => {
    if (!article?.content) return [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = Array.from(article.content.matchAll(headingRegex));
    return matches.map((match, index) => {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return { id, text, level, index };
    });
  }, [article?.content]);

  // Track active heading on scroll
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  // Mobile timeline drawer state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Track article view
  useEffect(() => {
    if (article) {
      const wordCount = article.content?.split(/\s+/).length || 0;
      const readingTime = Math.ceil(wordCount / 200);
      const tags = article.tags.map(tag => tag.name);

      view_article_detail(
        article.id,
        article.slug,
        article.title,
        article.category || undefined,
        tags.length > 0 ? tags : undefined,
        readingTime
      );
    }
  }, [article]);

  // Add IDs to headings and set up intersection observer
  useEffect(() => {
    if (!article || headings.length === 0) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('article h1, article h2, article h3');
      headingElements.forEach((element, index) => {
        if (headings[index]) {
          element.id = headings[index].id;
        }
      });

      // Set up intersection observer for active heading tracking
      const observerOptions = {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveHeading(entry.target.id);
          }
        });
      }, observerOptions);

      headingElements.forEach((element) => {
        if (element.id) observer.observe(element);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [headings, article?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50">
        <Skeleton className="h-[400px] w-full" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Article Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/articles">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Estimate reading time (average 200 words per minute)
  const wordCount = article.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.seo.metaDesc || article.title,
      url: window.location.href,
    };

    let shareMethod = 'clipboard';

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        shareMethod = 'native_share';
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(window.location.href);
          } catch (clipboardErr) {
            console.error('Failed to copy to clipboard:', clipboardErr);
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }

    // Track share event
    share_article(article.id, article.slug, article.title, shareMethod);
  };

  return (
    <div className="min-h-screen ">

      {/* Hero Section with Image */}
      <div 
        className="relative w-full h-[200px] sm:h-[280px] md:h-[300px] lg:h-[340px] mx-auto overflow-hidden border-b-4 mt-8"
        style={{
          borderBottomColor: getCategoryBorderColor(article?.category || null)
        }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: getCategoryGradient(article?.category || null)
          }}
        >
          <div className="absolute inset-0 opacity-[0.04] " />
        </div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-12">
            <div className="max-w-4xl">
              {/* Category Badge */}
              {article.category && (
                <div className="mb-3 sm:mb-4">
                  <Badge className="bg-white/10 text-white border-0 px-3 py-1 text-xs sm:text-sm font-medium backdrop-blur-sm">
                    {TextFormator(article.category)}
                  </Badge>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-6 drop-shadow-lg">
                {article.title}
              </h1>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <div className=" hidden items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{readingTime} {readingTime === 1 ? 'min' : 'mins'} read</span>
                </div>
                {article.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">{article.tags.length} {article.tags.length === 1 ? 'tag' : 'tags'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Share Button - Top Right */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-xl hover:bg-white hover:scale-110 transition-all group"
          aria-label="Share article"
          title="Share article"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:text-primary-600 transition-colors" />
        </button>
      </div>

      {/* Mobile Timeline Button - Floating */}
      {headings.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-4 z-40">
          <button
            onClick={() => setIsTimelineOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Open table of contents"
          >
            <Hash className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Timeline Drawer */}
      {headings.length > 0 && isTimelineOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsTimelineOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-semibold text-gray-900">Table of Contents</h3>
              </div>
              <button
                onClick={() => setIsTimelineOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {headings.map((heading) => {
                const isActive = activeHeading === heading.id;
                return (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(heading.id);
                      if (element) {
                        const offset = 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                        window.history.pushState(null, '', `#${heading.id}`);
                        setIsTimelineOpen(false);
                      }
                    }}
                    className={`block py-2 px-3 rounded-md text-sm transition-all duration-200 ${heading.level === 1
                        ? 'font-semibold'
                        : heading.level === 2
                          ? 'font-medium pl-4'
                          : 'font-normal pl-6 text-xs'
                      } ${isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {heading.text}
                  </a>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Article Content - Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
          {/* Main Article Content */}
          <article className="flex-1 min-w-0">

            {/* Main Content */}
            <div className="bg-white  shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 mb-6 sm:mb-8 md:mb-12">
              <div className="prose prose-sm max-w-none text-gray-900">
                <MarkdownRenderer content={article.content} />
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 mb-6 sm:mb-8 md:mb-12 border border-primary-500/30 shadow-lg">
              <div className="text-center max-w-2xl mx-auto">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/30">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">
                  Ready to Excel in Your Exams?
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-primary-100 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                  Join RankMarg today and get access to AI-powered practice, personalized study plans, and expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button className="bg-white text-primary-600 hover:bg-primary-50 font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full w-full sm:w-auto transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/ai-practice">
                    <Button
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full w-full sm:w-auto text-sm sm:text-base"
                    >
                      Try AI Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="mt-8 sm:mt-12 md:mt-16">
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Related Articles
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    Continue learning with these related articles
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/articles/${relatedArticle.slug}`}
                      onClick={() => click_related_article(
                        relatedArticle.id,
                        relatedArticle.slug,
                        relatedArticle.title,
                        article.id
                      )}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 transition-all hover:shadow-lg"
                    >
                      {relatedArticle.thumbnail && (
                        <div className="relative aspect-video">
                          <Image
                            src={relatedArticle.thumbnail}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-3 sm:p-4">
                        {relatedArticle.category && (
                          <Badge className="bg-primary-100 text-primary-700 border-primary-300 text-xs mb-2">
                            {TextFormator(relatedArticle.category)}
                          </Badge>
                        )}
                        <h3 className="text-gray-900 font-semibold text-sm mb-1 sm:mb-2 line-clamp-2">
                          {relatedArticle.title}
                        </h3>
                        {relatedArticle.seo.metaDesc && (
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {relatedArticle.seo.metaDesc}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Table of Contents - Desktop Only */}
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0 py-4">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-5">
                  <div className="mb-4 xl:mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="w-4 h-4 text-primary-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Contents</h3>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                  </div>
                  <nav className="space-y-0 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    {headings.map((heading) => {
                      const isActive = activeHeading === heading.id;
                      return (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(heading.id);
                            if (element) {
                              const offset = 100;
                              const elementPosition = element.getBoundingClientRect().top;
                              const offsetPosition = elementPosition + window.pageYOffset - offset;
                              window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                              });
                              window.history.pushState(null, '', `#${heading.id}`);
                            }
                          }}
                          className={`block py-1.5 px-2 rounded-md text-xs sm:text-sm transition-all duration-200 ${heading.level === 1
                            ? 'font-semibold'
                            : heading.level === 2
                              ? 'font-medium pl-3'
                              : 'font-normal pl-5 text-xs'
                            } ${isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                          {heading.text}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
