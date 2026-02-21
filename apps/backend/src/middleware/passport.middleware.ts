import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { ApiError, ErrorCode } from "@/types/common";
import { Role } from "@repo/db/enums";
import { AuthenticatedRequest, AuthenticatedUser } from "./auth.middleware";

/**
 * Middleware for authenticating requests using Passport JWT strategy
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: AuthenticatedUser, info: any) => {
      if (err) {
        console.log("err", err);
        return next(err);
      }
      console.log("user", user);
      if (!user) {
        console.log("info", info);
        return next(
          new ApiError(
            ErrorCode.UNAUTHORIZED,
            info?.message || "Authentication required",
            401
          )
        );
      }
      console.log("user", user);
      // Attach user to request
      req.user = user;
      next();
    }
  )(req, res, next);
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(
      new ApiError(ErrorCode.UNAUTHORIZED, "Authentication required", 401)
    );
  }

  if ((req.user as any).role !== Role.ADMIN) {
    return next(
      new ApiError(ErrorCode.FORBIDDEN, "Admin access required", 403)
    );
  }

  next();
};

/**
 * Middleware to check if user has instructor role (or admin)
 */
export const isInstructor = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(
      new ApiError(ErrorCode.UNAUTHORIZED, "Authentication required", 401)
    );
  }

  const role = (req.user as any).role;
  if (role !== Role.INSTRUCTOR && role !== Role.ADMIN) {
    return next(
      new ApiError(ErrorCode.FORBIDDEN, "Instructor access required", 403)
    );
  }

  next();
};

/**
 * Middleware to handle Google OAuth authentication
 */
export const authenticateGoogle = (req: Request, res: Response, next: NextFunction) => {
  const platform = (req.query.platform as string) || "web";
  const mobileRedirectUri = (req.query.redirect_uri as string); // Custom redirect for mobile (e.g. expo go)

  console.log(`[Auth] Initiating Google Auth. Platform: ${platform}, Mobile Redirect: ${mobileRedirectUri || 'default'}`);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
    state: JSON.stringify({ platform, mobileRedirectUri }), // Use JSON for multiple properties
  })(req, res, next);
};

/**
 * Middleware to handle Google OAuth callback
 */
export const authenticateGoogleCallback = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "google",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.error("[Auth] Google Auth failed:", info?.message);
        return next(
          new ApiError(
            ErrorCode.UNAUTHORIZED,
            info?.message || "Google authentication failed",
            401
          )
        );
      }

      // Capture platform and optional redirect from state
      let platform = "web";
      let mobileRedirectUri = null;

      try {
        if (req.query.state) {
          const stateData = JSON.parse(req.query.state as string);
          platform = stateData.platform || "web";
          mobileRedirectUri = stateData.mobileRedirectUri || null;
        }
      } catch (e) {
        console.error("[Auth] Error parsing OAuth state:", e);
        platform = (req.query.state as string) || "web";
      }

      console.log(`[Auth] Google Callback. Platform: ${platform}, Mobile Redirect: ${mobileRedirectUri || 'default'}`);

      (user as any).platform = platform;
      (user as any).mobileRedirectUri = mobileRedirectUri;

      // Attach user to request
      req.user = user;
      next();
    }
  )(req, res, next);
};
