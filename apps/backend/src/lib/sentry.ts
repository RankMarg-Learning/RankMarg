import * as Sentry from "@sentry/node";
import { ServerConfig } from "../config/server.config";

/**
 * Initialize Sentry for cron job error tracking
 * This should only be used for cron jobs, not for the main Express app
 */
export function initSentryForCronJobs(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = ServerConfig.nodeEnv || "development";

  if (!dsn) {
    console.warn(
      "⚠️  SENTRY_DSN not configured. Cron job error tracking will be disabled."
    );
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    beforeSend(event, hint) {
      if (event.contexts) {
        event.contexts.cron = {
          type: "cron_job",
        };
      } else {
        event.contexts = {
          cron: {
            type: "cron_job",
          },
        };
      }
      return event;
    },
    integrations: [
      // Add integrations as needed
    ],
  });

  console.log("✅ Sentry initialized for cron job error tracking");
}

/**
 * Capture an exception in Sentry with cron job context
 */
export function captureCronJobError(
  error: Error,
  context: {
    jobName: string;
    userId?: string;
    batchOffset?: number;
    additionalData?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag("cron_job", context.jobName);
    scope.setContext("cron_job_details", {
      job_name: context.jobName,
      user_id: context.userId,
      batch_offset: context.batchOffset,
      ...context.additionalData,
    });

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message in Sentry with cron job context
 */
export function captureCronJobMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    jobName: string;
    additionalData?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setTag("cron_job", context.jobName);
      scope.setContext("cron_job_details", {
        job_name: context.jobName,
        ...context.additionalData,
      });
    }

    Sentry.captureMessage(message, level);
  });
}

/**
 * Wrap a cron job function with Sentry error tracking
 */
export function withSentryCronJobTracking<T extends (...args: any[]) => Promise<any>>(
  jobName: string,
  jobFn: T
): T {
  return (async (...args: any[]) => {
    return Sentry.startSpan(
      {
        op: "cron.job",
        name: jobName,
      },
      async (span) => {
        Sentry.setTag("cron_job", jobName);
        
        try {
          const result = await jobFn(...args);
          span?.setStatus({ code: 1, message: "ok" }); // 1 = OK
          return result;
        } catch (error) {
          span?.setStatus({ code: 2, message: "internal_error" }); // 2 = Internal Error
          captureCronJobError(error instanceof Error ? error : new Error(String(error)), {
            jobName,
          });
          throw error;
        }
      }
    );
  }) as T;
}

/**
 * Capture a service-level error (not from cron jobs)
 */
export function captureServiceError(
  error: Error,
  context: {
    service: string;
    method: string;
    userId?: string;
    additionalData?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag("service", context.service);
    scope.setTag("method", context.method);
    scope.setContext("service_details", {
      service: context.service,
      method: context.method,
      user_id: context.userId,
      ...context.additionalData,
    });

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    Sentry.captureException(error);
  });
}

export default Sentry;

