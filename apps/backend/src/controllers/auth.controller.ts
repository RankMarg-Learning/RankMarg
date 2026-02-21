import { Request, Response, NextFunction } from "express";
import {
  SignInData,
  SignUpData,
  signInSchema,
  signUpSchema,
} from "@/types/auth";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import { ServerConfig } from "@/config/server.config";
import { AuthUtil } from "@/utils/auth.util";
import { ErrorCode } from "@/types/common";
import { Role } from "@repo/db/enums";
import { createTrialSubscription } from "@/utils/subscription.util";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { sendPasswordResetEmail } from "@/lib/email";

const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";

const getPrimaryFrontendOrigin = (): string => {
  const { origin } = ServerConfig.cors;

  if (!origin) {
    return DEFAULT_FRONTEND_ORIGIN;
  }

  if (typeof origin === "string") {
    return origin;
  }

  if (Array.isArray(origin) && origin.length > 0) {
    return origin[0];
  }

  return DEFAULT_FRONTEND_ORIGIN;
};

export const authController = {
  /**
   * Sign up a new user
   */
  signUp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = signUpSchema.safeParse(req.body);

      if (!result.success) {
        ResponseUtil.error(
          res,
          result.error.errors[0].message,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const { fullname, username, email, password } = result.data as SignUpData;

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        ResponseUtil.error(
          res,
          "Email already exists",
          400,
          ErrorCode.CONFLICT
        );
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        ResponseUtil.error(
          res,
          "Username already exists",
          400,
          ErrorCode.CONFLICT
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        ServerConfig.security.bcryptRounds
      );

      // Create user
      const user = await prisma.user.create({
        data: {
          name: fullname,
          username,
          email,
          password: hashedPassword,
          provider: "credentials",
          createdAt: new Date(),
          updatedAt: new Date(),
          role: Role.USER,
        },
      });

      // Create subscription
      await prisma.subscription.create({
        data: {
          user: { connect: { id: user.id } },
          ...createTrialSubscription(),
        },
      });

      //  success response
      ResponseUtil.created(res, null, "User created successfully");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if a username is available
   */
  checkUsername: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.query.username as string;

      if (!username || username.trim() === "") {
        ResponseUtil.error(
          res,
          "Username is required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const user = await prisma.user.findUnique({ where: { username } });

      if (user) {
        ResponseUtil.success(
          res,
          { available: false },
          "Username is already taken"
        );
      }

      ResponseUtil.success(res, { available: true }, "Username is available");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sign in a user
   */
  signIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = signInSchema.safeParse(req.body);

      if (!result.success) {
        ResponseUtil.error(
          res,
          result.error.errors[0].message,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const { username, password } = result.data as SignInData;

      // Find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: username }, { username }],
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          onboardingCompleted: true,
          createdAt: true,
          password: true,
          subscription: {
            select: {
              planId: true,
              status: true,
              currentPeriodEnd: true,
            },
          },
          examRegistrations: {
            select: {
              exam: {
                select: {
                  code: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        ResponseUtil.error(
          res,
          "Invalid username or password",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      // Create JWT payload
      const payload = {
        id: user.id,
        plan: {
          id: user.subscription?.planId ?? null,
          status: user.subscription?.status,
          endAt: user.subscription?.currentPeriodEnd ?? null,
        },
        examCode: user.examRegistrations[0]?.exam.code ?? "",
        role: user.role,
        isNewUser: !user.onboardingCompleted,
      };

      // Generate JWT
      const accessToken = AuthUtil.generateToken(payload);

      // Set token in HttpOnly cookie
      AuthUtil.setTokenCookie(res, accessToken);
      //  user data and token
      ResponseUtil.success(
        res,
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            examCode: user.examRegistrations[0]?.exam.code ?? "",
            isNewUser: !user.onboardingCompleted,
            plan: {
              id: user.subscription?.planId ?? null,
              status: user.subscription?.status,
              endAt: user.subscription?.currentPeriodEnd ?? null,
            },
          },
          // Still include the token in the response for clients that need it
          accessToken,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle Google OAuth callback
   */
  googleCallback: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        ResponseUtil.error(
          res,
          "Google authentication failed",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      const user = req.user as any;
      console.log(`[Auth] Processing Google Callback for user: ${user.email}, Platform: ${user.platform}`);

      // Create JWT payload
      const payload = {
        id: user.id,
        plan: user.plan,
        examCode: user.examCode || "",
        role: user.role,
        isNewUser: user.isNewUser,
      };

      // Generate JWT
      const accessToken = AuthUtil.generateToken(payload);

      // Set token in HttpOnly cookie
      AuthUtil.setTokenCookie(res, accessToken);

      // Determine redirect URL based on whether user is new
      const redirectUrl = user.isNewUser ? "/onboarding" : "/dashboard";

      // For browser response, redirect to frontend
      const frontendUrl = getPrimaryFrontendOrigin();

      if (user.platform === "mobile") {
        const baseRedirect = user.mobileRedirectUri || "rankmarg://auth-callback";
        // Ensure we don't double-append query markers
        const separator = baseRedirect.includes('?') ? '&' : '?';
        const mobileRedirect = `${baseRedirect}${separator}token=${accessToken}&isNewUser=${user.isNewUser}`;

        console.log(`[Auth] Mobile platform detected. Redirecting to: ${mobileRedirect}`);
        res.redirect(mobileRedirect);
        return;
      }

      console.log(`[Auth] Web platform detected. Redirecting to: ${frontendUrl}${redirectUrl}`);
      // For website, redirect to the frontend
      res.redirect(`${frontendUrl}${redirectUrl}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sign out a user
   */
  signOut: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Clear the auth token cookie
      AuthUtil.clearTokenCookie(res);

      ResponseUtil.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current authenticated user profile
   */
  getProfile: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req.user as any).id;

      if (!userId) {
        ResponseUtil.error(
          res,
          "Authentication required",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          isActive: true,
          onboardingCompleted: true,
          createdAt: true,
          subscription: {
            select: {
              planId: true,
              status: true,
              currentPeriodEnd: true,
            },
          },
          examRegistrations: {
            select: {
              exam: {
                select: {
                  code: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404, ErrorCode.NOT_FOUND);
      }

      ResponseUtil.success(
        res,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          examCode: user.examRegistrations[0]?.exam.code ?? "",
          isNewUser: !user.onboardingCompleted,
          isActive: user.isActive,
          createdAt: user.createdAt,
          plan: {
            id: user.subscription?.planId ?? null,
            status: user.subscription?.status,
            endAt: user.subscription?.currentPeriodEnd ?? null,
          },
        },
        "User profile retrieved successfully",
        200,
        undefined,
        {
          "Cache-Control": "private, max-age=90, stale-while-revalidate=60",
        }
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email || email.trim() === "") {
        ResponseUtil.error(
          res,
          "Email is required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Do not disclose user existence
        ResponseUtil.success(
          res,
          null,
          "If the email exists, a reset link has been sent"
        );
        return;
      }

      const jwt = await import("jsonwebtoken");
      const token = jwt.sign(
        { email, purpose: "password-reset" },
        ServerConfig.security.jwtSecret as string,
        { expiresIn: "1h" }
      );

      const frontendBase = getPrimaryFrontendOrigin();
      const resetUrl = `${frontendBase}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, resetUrl);

      ResponseUtil.success(
        res,
        null,
        "If the email exists, a reset link has been sent"
      );
      return;
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body as {
        token?: string;
        password?: string;
      };

      if (!token || !password) {
        ResponseUtil.error(
          res,
          "Token and password are required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
        return;
      }

      const jwt = await import("jsonwebtoken");
      let decoded: any;
      try {
        decoded = jwt.verify(token, ServerConfig.security.jwtSecret as string);
      } catch (err: any) {
        ResponseUtil.error(
          res,
          "Invalid or expired reset link",
          401,
          ErrorCode.UNAUTHORIZED
        );
        return;
      }

      if (!decoded || decoded.purpose !== "password-reset" || !decoded.email) {
        ResponseUtil.error(
          res,
          "Invalid reset token",
          401,
          ErrorCode.UNAUTHORIZED
        );
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });
      if (!user) {
        ResponseUtil.error(res, "User not found", 404, ErrorCode.NOT_FOUND);
        return;
      }

      const hashedPassword = await bcrypt.hash(
        password,
        ServerConfig.security.bcryptRounds
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      ResponseUtil.success(res, null, "Password reset successfully");
      return;
    } catch (error) {
      next(error);
    }
  },
};
