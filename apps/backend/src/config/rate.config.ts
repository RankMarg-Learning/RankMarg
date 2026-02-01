import { Request } from "express";
import rateLimit from "express-rate-limit";

export const getIp = (req: Request) => {
  return req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip;
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  keyGenerator: (req: Request) => {
    const ip = getIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";
    return `${ip}:${userAgent}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) =>
    `${getIp(req)}:${req.body?.email || "unknown"}`,
  message: {
    error: "Too many login attempts. Please wait.",
  },
});
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => getIp(req),
  message: {
    error: "Too many signup attempts. Try again later.",
  },
});

export const checkUsernameLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  keyGenerator: (req: Request) => getIp(req),
  message: { error: "Too many requests. Try later." },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => getIp(req),
  message: {
    error: "Too many requests. Try later.",
  },
});

