"use client";

import { Button } from "@repo/common-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticlesPagination } from "@/types/article.types";

interface PaginationProps {
  pagination: ArticlesPagination;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="gap-1 sm:gap-2 rounded-full"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500 text-sm">
                ...
              </span>
            );
          }

          const pageNumber = pageNum as number;
          const isActive = pageNumber === page;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={`rounded-full min-w-[36px] sm:min-w-[40px] ${
                isActive ? "bg-primary-500 hover:bg-primary-600 text-white" : ""
              }`}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="gap-1 sm:gap-2 rounded-full"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
