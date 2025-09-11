import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ServerConfig } from "../config/server.config";
import { ApiError, ErrorCode, SubscriptionTier } from "../types/common";
import prisma from "../lib/prisma";
import { Role } from "@repo/db/enums";
import { JwtPayload } from "@/types/auth";

export interface AuthenticatedUser {
  id: string;
  role?: Role;
  plan: {
    id?: string | null;
    status?: string;
    endAt?: Date | null;
  };
  examCode?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware to authenticate user based on JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies["x-auth-token"];

    if (!token) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        "Access denied. No token provided.",
        401
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        ServerConfig.security.jwtSecret!
      ) as JwtPayload;
      if (!decoded.id) {
        throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token.", 401);
      }
      req.user = {
        id: decoded.id,
        role: decoded.role as Role,
        plan: decoded.plan || { id: null, status: undefined, endAt: null },
        examCode: decoded.examCode,
      };
      next();
    } catch (jwtError) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token.", 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        "Authentication required.",
        401
      );
    }

    if (req.user.role !== Role.ADMIN) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        "Access denied. Admin role required.",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has instructor role
 */
export const isInstructor = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        "Authentication required.",
        401
      );
    }

    if (req.user.role !== Role.INSTRUCTOR && req.user.role !== Role.ADMIN) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        "Access denied. Instructor role required.",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check subscription status
 */
export const checkSubscription = (requiredTier: SubscriptionTier) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "Authentication required.",
          401
        );
      }

      // Skip check for admins
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      const subscription = await prisma.subscription.findFirst({
        where: { userId: req.user.id },
      });

      if (!subscription) {
        throw new ApiError(
          ErrorCode.SUBSCRIPTION_REQUIRED,
          "Subscription required.",
          403
        );
      }

      // Implement subscription tier checking logic
      // This is a simplified example - you'd need to define mapping between subscription status and tiers
      const userTier = getTierFromSubscription(subscription.status);
      if (!hasAccessToTier(userTier, requiredTier)) {
        throw new ApiError(
          ErrorCode.SUBSCRIPTION_REQUIRED,
          `${requiredTier} subscription required for this feature.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper to map subscription status to tier
 */
function getTierFromSubscription(status: string): SubscriptionTier {
  switch (status) {
    case "ACTIVE":
    case "PREMIUM":
      return SubscriptionTier.PREMIUM;
    case "BASIC":
      return SubscriptionTier.BASIC;
    case "TRIAL":
      return SubscriptionTier.FREE;
    default:
      return SubscriptionTier.FREE;
  }
}

/**
 * Helper to check if user tier has access to required tier
 */
function hasAccessToTier(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierLevels = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.BASIC]: 1,
    [SubscriptionTier.PREMIUM]: 2,
    [SubscriptionTier.ENTERPRISE]: 3,
  };

  return tierLevels[userTier] >= tierLevels[requiredTier];
}
