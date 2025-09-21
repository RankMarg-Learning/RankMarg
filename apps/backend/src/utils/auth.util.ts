import jwt from "jsonwebtoken";
import { ServerConfig } from "@/config/server.config";
import { CookieOptions, Response, Request } from "express";

const isProd = process.env.NODE_ENV === "production";

type UpdatePayloadFn = (payload: any) => any;

const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  domain: isProd ? ServerConfig.cookieDomain : undefined,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

export const AuthUtil = {
  /**
   * Generate JWT token
   */
  generateToken(payload: any): string {
    return jwt.sign(payload, ServerConfig.security.jwtSecret, {
      expiresIn: "30d",
    });
  },

  /**
   * Set JWT token in HttpOnly cookie
   */
  setTokenCookie(res: Response, token: string): void {
    res.cookie("x-auth-token", token, cookieConfig);
  },

  /**
   * Update JWT token in HttpOnly cookie
   */
  updateTokenCookie(req: Request, res: Response, updateFn: UpdatePayloadFn) {
    const token = req.cookies["x-auth-token"];

    if (!token) {
      throw new Error("Token not found in cookies");
    }
    const payload = AuthUtil.verifyToken(token);
    const { exp, iat, ...cleanPayload } = payload;

    const updatedPayload = updateFn(cleanPayload);

    const newToken = AuthUtil.generateToken(updatedPayload);
    AuthUtil.setTokenCookie(res, newToken);
    return newToken;
  },

  /**
   * Clear auth token cookie
   */
  clearTokenCookie(res: Response): void {
    res.clearCookie("x-auth-token", {
      ...cookieConfig,
      maxAge: 0,
    });
  },
  verifyToken(token: string): any {
    return jwt.verify(token, ServerConfig.security.jwtSecret);
  },

  /**
   * Extract token from cookie or header
   */
  extractToken(req: any): string | null {
    // First try to get from cookie
    if (req.cookies && req.cookies["x-auth-token"]) {
      return req.cookies["x-auth-token"];
    }

    // Fall back to Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  },
};
