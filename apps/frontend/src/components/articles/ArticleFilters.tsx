"use client";

import { Search } from "lucide-react";
import { ArticleCategory } from "@/types/article.types";

interface ArticleFiltersProps {
  categories: ArticleCategory[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export default function ArticleFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: ArticleFiltersProps) {

  return (
    <div className="space-y-4">
      {/* Search Bar - Matching home page style */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base shadow-sm"
        />
      </div>
    </div>
  );
}
