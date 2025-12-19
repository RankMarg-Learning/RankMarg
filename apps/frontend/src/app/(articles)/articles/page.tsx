"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ArticlesGrid from "@/components/articles/ArticlesGrid";
import Pagination from "@/components/articles/Pagination";
import ArticleFilters from "@/components/articles/ArticleFilters";
import { ArticlesResponse, ArticlesQueryParams } from "@/types/article.types";
import { Skeleton } from "@repo/common-ui";
import { 
  BookOpen, 
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/common-ui";

// Use Next.js API route to avoid CORS issues
async function fetchArticles(params: ArticlesQueryParams): Promise<ArticlesResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.isPublished !== undefined) queryParams.append("isPublished", params.isPublished.toString());
  if (params.category) queryParams.append("category", params.category);
  if (params.tag) queryParams.append("tag", params.tag);
  if (params.search) queryParams.append("search", params.search);

  // Use Next.js API route instead of direct external API call (solves CORS)
  const { data } = await axios.get<ArticlesResponse>(
    `/api/articles?${queryParams.toString()}`
  );

  return data;
}

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const queryParams: ArticlesQueryParams = {
    page,
    limit: 20,
    isPublished: true,
    ...(selectedCategory && { category: selectedCategory }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["articles", queryParams],
    queryFn: () => fetchArticles(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract unique categories from articles
  const categories = useMemo(() => {
    if (!data?.data) return [];
    const categoryMap = new Map<string, string>();
    data.data.forEach((article) => {
      if (article.category) {
        categoryMap.set(article.category, article.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [data]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-primary-50 overflow-hidden">
      {/* Hero Section - Matching home page style */}
      <section className="relative overflow-hidden bg-primary-50">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#eef2f7_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-12 md:pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-gray-800 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-gray-200 mb-6">
            <Sparkles className="w-4 h-4" />
            Expert Articles & Insights
          </div>

          {/* Heading */}
          <h1 className="font-Manrope text-[32px] leading-[1.15] sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            <span className="sm:hidden">Study Strategies for JEE & NEET Success</span>
            <span className="hidden sm:inline">
              Study Strategies for
              <br className="hidden sm:block" />
              <span className="inline-block mt-2">JEE & NEET Success</span>
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 mx-auto max-w-[680px] text-gray-600 text-[14px] sm:text-base md:text-lg mb-8">
            Discover proven study strategies, exam tips, and expert guidance to excel in your JEE & NEET journey. Learn from toppers and transform your preparation.
          </p>

          {/* CTA Button */}
          <div className="mt-6 flex items-center justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-6 md:px-8 py-6 rounded-full">
                Start Free Practice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Filters Section */}
          <div className="mb-8 md:mb-12">
            <ArticleFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results Header */}
          {!isLoading && !error && data && (
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
                  {searchQuery || selectedCategory ? "Search Results" : "All Articles"}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Showing <span className="font-semibold text-gray-900">{data.data.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{data.pagination.total}</span> articles
                </p>
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors self-start sm:self-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-200">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load articles</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  We're having trouble loading the articles. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !error && data && data.data.length > 0 && (
            <>
              <ArticlesGrid articles={data.data} />
              
              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="mt-8 md:mt-12">
                  <Pagination
                    pagination={data.pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && !error && data && data.data.length === 0 && (
            <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-gray-200 ring-1 ring-gray-200">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles found</h3>
                <p className="text-gray-600 mb-8 text-sm md:text-base">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Check back later for new content!"}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Matching home page style */}
      <div className="bg-primary-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-Manrope text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Ready to Transform Your Preparation?
          </h2>

          <p className="font-Inter text-base md:text-lg lg:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of students who trust RankMarg for their NEET/JEE success journey.
          </p>

          <div className="mb-10">
            <Link href="/sign-up">
              <Button
                className="bg-white text-primary-900 hover:bg-primary-100 font-semibold px-8 py-6 text-base rounded-xl shadow-md transition-all duration-300 hover:scale-105"
              >
                Start Free Now
              </Button>
            </Link>
          </div>

          {/* Optional: Add metrics here if needed */}
        </div>
      </div>
    </div>
  );
}
