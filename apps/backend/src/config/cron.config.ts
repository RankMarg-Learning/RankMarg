import cron, { ScheduledTask } from "node-cron";
import { ServerConfig } from "./server.config";
import { updatePerformanceJob } from "../jobs/tasks/updatePerformance.job";
import { streakJob } from "../jobs/tasks/streak.job";
import { updateReviewJob } from "../jobs/tasks/review.update.job";
import { updateMasteryJob } from "../jobs/tasks/mastery.update.job";
import { createSessionJob } from "../jobs/tasks/session.create.job";
import { createSuggestion } from "../jobs/tasks/suggest.create.job";
import { updateUserActivityJob } from "../jobs/tasks/userActivity.job";
import { subscriptionExpiredJob } from "../jobs/tasks/userActivity.job";
import { updateGradeJob } from "@/jobs/tasks/grade.job";
import { updatePromocodeJob } from "@/jobs/tasks/promocode.job";
import { updateQuestionsPerDayJob } from "@/jobs/tasks/questionsPerDay.update.job";

export interface CronJob {
  name: string;
  schedule: string;
  job: () => void | Promise<void>;
  enabled: boolean;
  description: string;
}

export class CronManager {
  private jobs: Map<string, ScheduledTask> = new Map();
  private jobConfigs: CronJob[] = [
    {
      name: "streak",
      schedule: ServerConfig.cron.daily.streak,
      job: streakJob, // Every day at midnight
      enabled: true,
      description: "Reset user streaks daily at midnight",
    },
    {
      name: "updatePerformance",
      schedule: ServerConfig.cron.daily.updatePerformance,
      job: updatePerformanceJob, // Every day at midnight
      enabled: true,
      description: "Update user performance metrics daily at midnight",
    },
    {
      name: "createSuggestion",
      schedule: ServerConfig.cron.daily.createSuggestion,
      job: createSuggestion, // Every day at midnight
      enabled: true,
      description: "Create study suggestions daily at midnight",
    },
    {
      name: "updateReview",
      schedule: ServerConfig.cron.weekly.updateReview, 
      job: updateReviewJob,
      enabled: true,
      description: "Update review schedules weekly on Sunday at midnight",
    },
    {
      name: "updateMastery",
      schedule: ServerConfig.cron.weekly.updateMastery,
      job: updateMasteryJob, // Every Sunday at midnight
      enabled: true,
      description: "Update mastery levels weekly on Sunday at midnight",
    },
    {
      name: "createSession",
      schedule: ServerConfig.cron.frequent.createSession,
      job: createSessionJob, // Every day at 12:00 AM
      enabled: true,
      description: "Create practice sessions every 3 minutes",
    },
    {
      name: "updateGrade",
      schedule: "0 2 * * *", // Every day at 2 AM
      job: updateGradeJob,
      enabled: true,
      description: "Update user grades every day at 2 AM",
    },
    {
      name: "updateUserActivity",
      schedule: "0 3 * * *", // Daily at 3 AM
      job: updateUserActivityJob,
      enabled: false,
      description: "Update user activity status daily at 3 AM",
    },
    {
      name: "subscriptionExpired",
      schedule: "0 23 * * *", // Daily at 11:50 PM
      job: subscriptionExpiredJob,
      enabled: true,
      description:
        "Check if the subscription is expired and mark the user as inactive daily at 11:50 PM",
    },
    {
      name: "updatePromocode",
      schedule: "0 0 * * 0", // weekly on sunday at midnight
      job: updatePromocodeJob,
      enabled: true,
      description: "Update promo code usage count weekly on Sunday at midnight",
    },
    {
      name: "updateQuestionsPerDay",
      schedule: "0 3 */5 * *", // Every 5 days at 3 AM
      job: updateQuestionsPerDayJob,
      enabled: true,
      description:
        "Update user questionsPerDay field based on last 5 days attempts from top 3 subjects",
    }
  ];

  public initialize(): void {
    console.log("🕐 Initializing cron jobs...");

    this.jobConfigs.forEach((jobConfig) => {
      if (jobConfig.enabled) {
        this.scheduleJob(jobConfig);
      }
    });

    console.log(`✅ Scheduled ${this.jobs.size} cron jobs`);
  }

  private scheduleJob(jobConfig: CronJob): void {
    try {
      const scheduledTask = cron.schedule(
        jobConfig.schedule,
        async () => {
          console.log(`🔄 Running cron job: ${jobConfig.name}`);
          const startTime = Date.now();

          try {
            await jobConfig.job();
            const duration = Date.now() - startTime;
            console.log(
              `✅ Cron job ${jobConfig.name} completed in ${duration}ms`
            );
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(
              `❌ Cron job ${jobConfig.name} failed after ${duration}ms:`,
              error
            );
          }
        },
        {
          timezone: "Asia/Kolkata",
        }
      );

      this.jobs.set(jobConfig.name, scheduledTask);
      console.log(
        `📅 Scheduled ${jobConfig.name}: ${jobConfig.schedule} - ${jobConfig.description}`
      );
    } catch (error) {
      console.error(`❌ Failed to schedule cron job ${jobConfig.name}:`, error);
    }
  }

  public getJobStatus(): Array<{
    name: string;
    schedule: string;
    enabled: boolean;
    description: string;
    running: boolean;
  }> {
    return this.jobConfigs.map((jobConfig) => ({
      name: jobConfig.name,
      schedule: jobConfig.schedule,
      enabled: jobConfig.enabled,
      description: jobConfig.description,
      running: this.jobs.has(jobConfig.name),
    }));
  }

  public stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`⏹️ Stopped cron job: ${jobName}`);
      return true;
    }
    return false;
  }

  public startJob(jobName: string): boolean {
    const jobConfig = this.jobConfigs.find((j) => j.name === jobName);
    if (jobConfig && jobConfig.enabled) {
      this.scheduleJob(jobConfig);
      return true;
    }
    return false;
  }

  public stopAllJobs(): void {
    console.log("🛑 Stopping all cron jobs...");
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  public runJobNow(jobName: string): Promise<void> {
    const jobConfig = this.jobConfigs.find((j) => j.name === jobName);
    if (jobConfig) {
      console.log(`🚀 Manually running cron job: ${jobName}`);
      return Promise.resolve(jobConfig.job());
    }
    throw new Error(`Job ${jobName} not found`);
  }
}

export const cronManager = new CronManager();
export default cronManager;
