import express from "express";
import { authController } from "@/controllers/auth.controller";
import {
  authenticateGoogle,
  authenticateGoogleCallback,
} from "@/middleware/passport.middleware";
import { authenticate } from "@/middleware/auth.middleware";
import { checkUsernameLimiter, forgotPasswordLimiter, signinLimiter, signupLimiter } from "@/config/rate.config";

const router = express.Router();

/**
 * @route POST /auth/sign-up
 * @desc Register a new user
 * @access Public
 */
router.post("/sign-up", signupLimiter, authController.signUp);

/**
 * @route POST /auth/sign-in
 * @desc Authenticate a user & get token
 * @access Public
 */
router.post("/sign-in", signinLimiter, authController.signIn);

/**
 * @route GET /auth/check-username
 * @desc Check if username is available
 * @access Public
 */
router.get("/check-username",checkUsernameLimiter, authController.checkUsername);

/**
 * @route GET /auth/google
 * @desc Authenticate with Google
 * @access Public
 */
router.get("/google", authenticateGoogle);

/**
 * @route GET /auth/google/callback
 * @desc Google OAuth callback
 * @access Public
 */
router.get(
  "/google/callback",
  authenticateGoogleCallback,
  authController.googleCallback
);

/**
 * @route GET /auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @route POST /auth/sign-out
 * @desc Sign out a user
 * @access Public
 */
router.post("/sign-out", authController.signOut);

router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
