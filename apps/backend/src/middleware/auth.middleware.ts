import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ServerConfig } from "../config/server.config";
import { ApiError, ErrorCode, SubscriptionTier } from "../types/common";
import prisma from "../lib/prisma";

export interface AuthenticatedUser {
  id: string;
  plan: {
    id?: string;
    status?: string;
    endAt?: Date;
  };
  examCode?: string;
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

      if (!decoded.id) {
        throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token.", 401);
      }
      req.user = decoded;
      next();
    } catch (jwtError) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token.", 401);
    }
  } catch (error) {
    next(error);
  }
};
