"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@repo/common-ui";
import { BlogItem } from "@/types/homeConfig.types";
import { cn } from "@/lib/utils";

// tag → colour
const TAG_COLOR: Record<string, string> = {
  Strategy:
    "bg-blue-50 text-blue-700 border-blue-200",
  Important:
    "bg-rose-50 text-rose-700 border-rose-200",
  Guidance:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function BlogCard({ blog }: { blog: BlogItem }) {
  const tagStyle =
    TAG_COLOR[blog.tag] ?? "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <Link
      href={blog.slug}
      className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 hover:shadow-sm"
    >
      {/* Thumbnail / placeholder icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
        {blog.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <BookOpen className="w-5 h-5 text-primary-500" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <Badge
          variant="outline"
          className={cn("text-[10px] font-semibold mb-1 border", tagStyle)}
        >
          {blog.tag}
        </Badge>
        <p className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-primary-700 line-clamp-2 leading-snug transition-colors duration-200">
          {blog.title}
        </p>
      </div>

      {/* Arrow icon */}
      <ArrowRight className="flex-shrink-0 w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors duration-200 mt-1" />
    </Link>
  );
}

interface ImportantBlogsProps {
  title: string;
  blogs: BlogItem[];
}

export default function ImportantBlogs({ title, blogs }: ImportantBlogsProps) {
  const sorted = [...blogs].sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
  );

  if (!sorted.length) return null;

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-4 h-4 text-primary-600 flex-shrink-0" />
        <h2 className="text-sm font-semibold text-gray-800 flex-1 truncate">
          {title}
        </h2>
      </div>

      {/* Blog cards */}
      <div className="flex flex-col gap-2">
        {sorted.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
