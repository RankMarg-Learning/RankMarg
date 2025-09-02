import { z } from "zod";

// Common response structure for all APIs
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: string;
  version: string;
}

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Common error types
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMITED = "RATE_LIMITED",
  SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Subscription tiers for access control
export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  tier: SubscriptionTier;
}

export const RATE_LIMITS: Record<SubscriptionTier, RateLimitConfig> = {
  [SubscriptionTier.FREE]: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    tier: SubscriptionTier.FREE,
  },
  [SubscriptionTier.BASIC]: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 500,
    tier: SubscriptionTier.BASIC,
  },
  [SubscriptionTier.PREMIUM]: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 2000,
    tier: SubscriptionTier.PREMIUM,
  },
  [SubscriptionTier.ENTERPRISE]: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10000,
    tier: SubscriptionTier.ENTERPRISE,
  },
};
