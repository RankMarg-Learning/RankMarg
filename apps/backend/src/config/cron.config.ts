import cron, { ScheduledTask } from "node-cron";
import { ServerConfig } from "./server.config";
import { updatePerformanceJob } from "../jobs/updatePerformance.job";
import { resetStreakJob } from "../jobs/resetStreak.job";
import { updateReviewJob } from "../jobs/review.update.job";
import { updateMasteryJob } from "../jobs/mastery.update.job";
import { updateLearningProgressJob } from "../jobs/learning.update.job";
import { createSessionJob } from "../jobs/session.create.job";
import { createSuggestion } from "../jobs/suggest.create.job";

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
      name: "resetStreak",
      schedule: ServerConfig.cron.daily.resetStreak,
      job: resetStreakJob,
      enabled: true,
      description: "Reset user streaks daily at midnight",
    },
    {
      name: "updatePerformance",
      schedule: ServerConfig.cron.daily.updatePerformance,
      job: updatePerformanceJob,
      enabled: true,
      description: "Update user performance metrics daily at midnight",
    },
    {
      name: "createSuggestion",
      schedule: ServerConfig.cron.daily.createSuggestion,
      job: createSuggestion,
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
      job: updateMasteryJob,
      enabled: true,
      description: "Update mastery levels weekly on Sunday at midnight",
    },
    {
      name: "updateLearningProgress",
      schedule: ServerConfig.cron.weekly.updateLearningProgress,
      job: updateLearningProgressJob,
      enabled: true,
      description: "Update learning progress weekly on Sunday at 1 AM",
    },
    {
      name: "createSession",
      schedule: ServerConfig.cron.frequent.createSession,
      job: createSessionJob,
      enabled: true,
      description: "Create practice sessions every 3 minutes",
    },
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
