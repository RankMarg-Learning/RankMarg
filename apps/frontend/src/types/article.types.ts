export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}



export interface ArticleSEO {
  metaTitle: string | null;
  metaDesc: string | null;
  metaImage: string | null;
  ogImage: string | null;
  robots: string | null;
  structuredData: object | null;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string; // Full article content (markdown/html) - always present in detail view
  thumbnail: string | null;
  category: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: ArticleTag[];
  seo: ArticleSEO;
}

export interface ArticlesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticlesResponse {
  data: Article[];
  pagination: ArticlesPagination;
}

export interface ArticlesQueryParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  category?: string;
  tag?: string;
  search?: string;
}
