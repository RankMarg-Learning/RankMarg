import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { Request } from "express";
import rateLimit from "express-rate-limit";

export const getIp = (req: Request) => {
  return req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip;
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: (req: Request) => {
    return getIp(req);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) =>
    `${getIp(req)}:${req.body?.email || "unknown"}`,
  message: {
    error: "Too many login attempts. Please wait.",
  },
});
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    error: "Too many signup attempts. Try again later.",
  },
});

export const checkUsernameLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Try later." },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Too many requests. Try later.",
  },
});

