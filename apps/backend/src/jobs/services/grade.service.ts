import prisma from "@repo/db";
import {
  BaseJobService,
  JobConfig,
  UserBatch,
  ProcessingResult,
} from "./BaseJobService";
import { StudentGradeService } from "@/services/grade.service";
import { GradeEnum, Role, SubscriptionStatus } from "@repo/db/enums";
import { captureServiceError } from "../../lib/sentry";

interface GradeResult {
  userId: string;
  grade: GradeEnum;
}

export class GradeService extends BaseJobService {
  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 50,
      concurrencyLimit: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    });
  }
  protected async getTotalUserCount(): Promise<number> {
    return await prisma.user.count({
      where: {
        isActive: true,
        role: {
          notIn: [Role.ADMIN],
        },
        examRegistrations: {
          some: {},
        },
      },
    });
  }

  protected async getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]> {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          notIn: [Role.ADMIN],
        },
        examRegistrations: {
          some: {},
        },
      },
      select: {
        id: true,
        examRegistrations: {
          select: {
            examCode: true,
          },
        },
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
      skip: offset,
      take: batchSize,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Filter and map users, ensuring they have exam registrations
    return users
      .filter(
        (user) => user.examRegistrations && user.examRegistrations.length > 0
      )
      .map((user) => ({
        userId: user.id,
        examCode: user.examRegistrations[0].examCode,
        subscription: user.subscription,
        user: user,
      }));
  }

  protected async processOneUser(user: UserBatch): Promise<void> {
    // This method is kept for compatibility with base class
    // The actual processing is done in processUserBatch
    throw new Error(
      "This method should not be called directly. Use processUserBatch instead."
    );
  }

  /**
   * Process a single user and return the grade result
   */
  private async processUserForGrade(user: UserBatch): Promise<GradeResult> {
    const { userId, examCode, subscription } = user;

    const isPaidUser =
      subscription.status !== SubscriptionStatus.EXPIRED &&
      new Date(subscription.currentPeriodEnd) > new Date();

    const gradeService = new StudentGradeService(
      userId,
      28,
      examCode,
      isPaidUser
    );
    const grade = await gradeService.calculateUserGrade();

    return {
      userId,
      grade,
    };
  }

  /**
   * Process a single user with retry logic and return GradeResult
   */
  private async processUserWithRetryForGrade(
    user: UserBatch
  ): Promise<GradeResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await this.processUserForGrade(user);
        return result; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retryAttempts) {
          this.logger.warn(
            `Attempt ${attempt} failed for user ${user.userId}, retrying in ${this.config.retryDelay}ms:`,
            lastError.message
          );
          await this.wait(this.config.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw (
      lastError ||
      new Error(
        `Failed to process user ${user.userId} after ${this.config.retryAttempts} attempts`
      )
    );
  }

  /**
   * Override processUserBatch to collect grades and store them in a single transaction
   */
  public async processUserBatch(
    batchSize: number,
    offset: number
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];
    const gradeResults: GradeResult[] = [];

    try {
      const users = await this.getUserBatch(batchSize, offset);

      if (users.length === 0) {
        return {
          success: true,
          processed: 0,
          failed: 0,
          duration: 0,
          errors: [],
        };
      }

      // Process users in chunks with concurrency control
      const chunks = this.createChunks(users, this.config.concurrencyLimit);

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (user) => {
          try {
            const gradeResult = await this.processUserWithRetryForGrade(user);
            gradeResults.push(gradeResult);
            processed++;
          } catch (error) {
            failed++;
            const errorMsg = `User ${user.userId}: ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);
          }
        });

        await Promise.all(chunkPromises);
      }

      // Store all grades in a single transaction
      if (gradeResults.length > 0) {
        await this.storeGradesInBatch(gradeResults);
      }

      const duration = Date.now() - startTime;
      return { success: failed === 0, processed, failed, duration, errors };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Error processing batch at offset ${offset}:`, error);
      return {
        success: false,
        processed,
        failed,
        duration,
        errors: [
          ...errors,
          error instanceof Error ? error.message : String(error),
        ],
      };
    }
  }

  /**
   * Store all grades in a single database transaction
   */
  private async storeGradesInBatch(gradeResults: GradeResult[]): Promise<void> {
    if (gradeResults.length === 0) {
      return;
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Create update operations for each user's grade
        const updatePromises = gradeResults.map(({ userId, grade }) =>
          tx.user.update({
            where: { id: userId },
            data: { grade: grade },
          })
        );

        // Execute all updates in parallel within the transaction
        await Promise.all(updatePromises);
      });

      this.logger.info(
        `Successfully stored ${gradeResults.length} grades in batch`
      );
    } catch (error) {
      this.logger.error(`Failed to store grades in batch:`, error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "GradeService",
          method: "storeGradesInBatch",
          additionalData: {
            gradeResultsCount: gradeResults.length,
          },
        });
      }
      throw error;
    }
  }

  /**
   * Utility method to chunk arrays
   */
  private createChunks<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Utility method for delays
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
