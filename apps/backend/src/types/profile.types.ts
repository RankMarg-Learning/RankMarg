// import { z } from "zod";
// import { PaginationSchema } from "./common";

// // Profile query validation
// export const ProfileQuerySchema = z.object({
//   includePerformance: z.boolean().default(true),
//   includeSubscription: z.boolean().default(false),
//   fields: z.string().optional(), // Comma-separated list of fields to include
// });

// export type ProfileQuery = z.infer<typeof ProfileQuerySchema>;

// // User basic profile interface
// export interface UserProfile {
//   id: string;
//   username: string;
//   name: string | null;
//   email: string | null;
//   avatar: string | null;
//   phone: string | null;
//   location: string | null;
//   standard: string | null;
//   targetYear: number | null;
//   coins: number;
//   studyHoursPerDay: number | null;
//   createdAt: Date;
//   userPerformance?: UserPerformance | null;
//   subscription?: UserSubscription | null;
// }

// export interface UserPerformance {
//   accuracy: number | null;
//   streak: number | null;
//   avgScore: number | null;
//   totalAttempts: number;
//   subjectWiseAccuracy: Record<string, { accuracy: number }> | null;
// }

// export interface UserSubscription {
//   planId: string | null;
//   status: string;
//   currentPeriodEnd: Date | null;
//   tier: string;
// }

// // Current studies query validation
// export const CurrentStudiesQuerySchema = z
//   .object({
//     subjectId: z.coerce.number().int().positive().optional(),
//     topicId: z.coerce.number().int().positive().optional(),
//     includeCompleted: z.boolean().default(false),
//     isCurrent: z.boolean().default(true),
//     uniqueSubjects: z.boolean().default(false),
//   })
//   .merge(PaginationSchema.omit({ sortBy: true }));

// export type CurrentStudiesQuery = z.infer<typeof CurrentStudiesQuerySchema>;

// export interface StudyTopic {
//   id: string;
//   isCurrent: boolean;
//   isCompleted: boolean;
//   startedAt: string;
//   // subjectId?: number;
//   subjectName: string;
//   topicName: string;
// }

// // Activity query validation
// export const ActivityQuerySchema = z
//   .object({
//     type: z.enum(["Profile", "Mission", "Achievement", "Study"]).optional(),
//     dateFrom: z.string().datetime().optional(),
//     dateTo: z.string().datetime().optional(),
//   })
//   .merge(PaginationSchema);

// export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;

// export interface Activity {
//   id: string;
//   type: string;
//   message: string;
//   earnCoin: number;
//   createdAt: string;
//   metadata?: Record<string, unknown>;
// }

// export interface ActivityResponse {
//   activities: Activity[];
//   pagination: {
//     total: number;
//     page: number;
//     limit: number;
//     pages: number;
//   };
// }
