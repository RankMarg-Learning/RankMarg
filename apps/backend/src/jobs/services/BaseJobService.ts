import { Logger } from "../../lib/logger";

export interface JobConfig {
  batchSize: number;
  concurrencyLimit: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTimeout: number;
}

export interface ProcessingResult {
  success: boolean;
  processed: number;
  failed: number;
  duration: number;
  errors: string[];
}

export interface UserBatch {
  userId: string;
  [key: string]: any;
}

export abstract class BaseJobService {
  protected readonly config: JobConfig;
  protected readonly logger: Logger;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: Partial<JobConfig> = {}) {
    this.config = {
      batchSize: 50,
      concurrencyLimit: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    };
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Main entry point for processing all users
   */
  public async processAllUsers(): Promise<ProcessingResult> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    try {
      const totalCount = await this.getTotalUserCount();
      this.logger.info(`Starting processing for ${totalCount} users`);

      let offset = 0;
      while (offset < totalCount) {
        const batchResult = await this.processUserBatch(
          this.config.batchSize,
          offset
        );
        totalProcessed += batchResult.processed;
        totalFailed += batchResult.failed;
        errors.push(...batchResult.errors);

        this.logger.info(
          `Processed batch: ${offset + this.config.batchSize}/${totalCount} users`
        );

        offset += this.config.batchSize;
      }

      const duration = Date.now() - startTime;
      this.logger.info(
        `Completed processing: ${totalProcessed} processed, ${totalFailed} failed in ${duration}ms`
      );

      return {
        success: totalFailed === 0,
        processed: totalProcessed,
        failed: totalFailed,
        duration,
        errors,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Fatal error during processing:`, error);
      return {
        success: false,
        processed: totalProcessed,
        failed: totalFailed,
        duration,
        errors: [
          ...errors,
          error instanceof Error ? error.message : String(error),
        ],
      };
    }
  }

  /**
   * Process a batch of users with optimized concurrency control
   */
  public async processUserBatch(
    batchSize: number,
    offset: number
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

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
      const chunks = this.chunkArray(users, this.config.concurrencyLimit);

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (user) => {
          try {
            await this.processOneUserWithRetry(user);
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
   * Process a single user with retry logic
   */
  private async processOneUserWithRetry(user: UserBatch): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.processOneUser(user);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retryAttempts) {
          this.logger.warn(
            `Attempt ${attempt} failed for user ${user.userId}, retrying in ${this.config.retryDelay}ms:`,
            lastError.message
          );
          await this.delay(this.config.retryDelay * attempt); // Exponential backoff
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
   * Get cached data or fetch and cache it
   */
  protected async getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enableCaching) {
      return await fetchFn();
    }

    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Clear cache
   */
  protected clearCache(): void {
    this.cache.clear();
  }

  /**
   * Utility method to chunk arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract getTotalUserCount(): Promise<number>;
  protected abstract getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]>;
  protected abstract processOneUser(user: UserBatch): Promise<void>;

  /**
   * Optional method for cleanup after processing
   */
  protected async cleanup(): Promise<void> {
    this.clearCache();
  }
}
