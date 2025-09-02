import { Router } from "express";
import { z } from "zod";
import { ProfileController } from "../controllers/profile.controller";
import {
  authenticate,
  authenticateOptional,
  requireSubscription,
} from "../middleware/auth.middleware";
import {
  validateQuery,
  validateBody,
  validateParams,
} from "../middleware/validation.middleware";
import { rateLimit } from "../middleware/rateLimiting.middleware";
import {
  ProfileQuerySchema,
  CurrentStudiesQuerySchema,
  ActivityQuerySchema,
} from "../types/profile.types";
import { SubscriptionTier } from "../types/common";

const router = Router();
const profileController = new ProfileController();

// Parameter validation schemas
const UsernameParamSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid username format"),
});

const StudyTopicParamSchema = z.object({
  studyTopicId: z.string().uuid("Invalid study topic ID"),
});

// Body validation schemas
const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    avatar: z.string().url().optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s-()]+$/)
      .optional(),
    location: z.string().min(1).max(100).optional(),
    standard: z.string().min(1).max(20).optional(),
    targetYear: z.string().min(4).max(4).optional(),
    studyHoursPerDay: z.number().int().min(1).max(24).optional(),
  })
  .strict();

const StartStudyTopicSchema = z
  .object({
    subjectId: z.number().int().positive(),
    topicId: z.number().int().positive(),
  })
  .strict();

const UpdateStudyTopicSchema = z
  .object({
    isCurrent: z.boolean().optional(),
    isCompleted: z.boolean().optional(),
  })
  .strict();

// Rate limiting for all routes
router.use(rateLimit());

// Profile routes
router.get(
  "/username/:username",
  authenticateOptional,
  validateParams(UsernameParamSchema),
  validateQuery(ProfileQuerySchema),
  profileController.getProfileByUsername
);

router.get(
  "/me",
  authenticate,
  validateQuery(ProfileQuerySchema),
  profileController.getMyProfile
);

router.patch(
  "/me",
  authenticate,
  validateBody(UpdateProfileSchema),
  profileController.updateProfile
);

// Current studies routes
router.get(
  "/me/studies",
  authenticate,
  validateQuery(CurrentStudiesQuerySchema),
  profileController.getCurrentStudies
);

router.post(
  "/me/studies",
  authenticate,
  validateBody(StartStudyTopicSchema),
  profileController.startStudyTopic
);

router.patch(
  "/me/studies/:studyTopicId",
  authenticate,
  validateParams(StudyTopicParamSchema),
  validateBody(UpdateStudyTopicSchema),
  profileController.updateStudyTopic
);

router.get("/me/studies/stats", authenticate, profileController.getStudyStats);

// Activity routes
router.get(
  "/me/activities",
  authenticate,
  validateQuery(ActivityQuerySchema),
  profileController.getUserActivities
);

router.get(
  "/me/activities/stats",
  authenticate,
  profileController.getActivityStats
);

// Premium feature - Activity insights
router.get(
  "/me/activities/insights",
  authenticate,
  requireSubscription(SubscriptionTier.BASIC),
  profileController.getActivityInsights
);

export default router;
