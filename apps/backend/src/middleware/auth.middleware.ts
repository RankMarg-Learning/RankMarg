import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ServerConfig } from "../config/server.config";
import { ApiError, ErrorCode, SubscriptionTier } from "../types/common";
import prisma from "../lib/prisma";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  subscriptionTier: SubscriptionTier;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.header("x-auth-token");

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
      ) as any;

      // Fetch user with subscription info
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          subscription: {
            select: {
              status: true,
              planId: true,
              currentPeriodEnd: true,
            },
          },
        },
      });

      if (!user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "Invalid token. User not found.",
          401
        );
      }

      // Determine subscription tier
      let subscriptionTier = SubscriptionTier.FREE;
      if (user.subscription?.status === "ACTIVE") {
        switch (user.subscription.planId) {
          case "basic":
            subscriptionTier = SubscriptionTier.BASIC;
            break;
          case "premium":
            subscriptionTier = SubscriptionTier.PREMIUM;
            break;
          case "enterprise":
            subscriptionTier = SubscriptionTier.ENTERPRISE;
            break;
          default:
            subscriptionTier = SubscriptionTier.FREE;
        }
      }

      req.user = {
        id: user.id,
        username: user.username!,
        email: user.email!,
        role: user.role,
        subscriptionTier,
      };

      next();
    } catch (jwtError) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token.", 401);
    }
  } catch (error) {
    next(error);
  }
};

export const requireSubscription = (requiredTier: SubscriptionTier) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        "Authentication required.",
        401
      );
    }

    const tierOrder = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.BASIC]: 1,
      [SubscriptionTier.PREMIUM]: 2,
      [SubscriptionTier.ENTERPRISE]: 3,
    };

    if (tierOrder[req.user.subscriptionTier] < tierOrder[requiredTier]) {
      throw new ApiError(
        ErrorCode.SUBSCRIPTION_REQUIRED,
        `This feature requires ${requiredTier} subscription or higher.`,
        403
      );
    }

    next();
  };
};

// Optional auth: attaches user when token is present; otherwise proceeds without error
export const authenticateOptional = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.header("x-auth-token");

    if (!token) return next();

    const decoded = jwt.verify(token, ServerConfig.security.jwtSecret!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        subscription: {
          select: { status: true, planId: true, currentPeriodEnd: true },
        },
      },
    });

    if (user) {
      let subscriptionTier = SubscriptionTier.FREE;
      if (user.subscription?.status === "ACTIVE") {
        switch (user.subscription.planId) {
          case "basic":
            subscriptionTier = SubscriptionTier.BASIC;
            break;
          case "premium":
            subscriptionTier = SubscriptionTier.PREMIUM;
            break;
          case "enterprise":
            subscriptionTier = SubscriptionTier.ENTERPRISE;
            break;
        }
      }

      req.user = {
        id: user.id,
        username: user.username!,
        email: user.email!,
        role: user.role,
        subscriptionTier,
      };
    }

    next();
  } catch (_err) {
    // ignore errors for optional flow
    next();
  }
};
