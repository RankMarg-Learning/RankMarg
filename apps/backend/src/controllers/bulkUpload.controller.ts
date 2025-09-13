import jobStorage, { BulkUploadJob } from "@/lib/redis-job-storage";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { processImageToQuestion } from "@/services/ai/gpt-vision.service";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";
import { v4 as uuid } from "uuid";

export class BulkUploadController {
  createJob = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        subjectId,
        topicId,
        gptModel = "gpt-4o-mini",
        urls,
        additionalInstructions = "",
      } = req.body;
      const userId = req.user.id;
      if (!subjectId) {
        ResponseUtil.error(res, "Subject ID is required", 400);
      }

      if (urls.length === 0) {
        ResponseUtil.error(res, "At least one URL is required", 400);
      }
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: { topics: true },
      });
      if (!subject) {
        ResponseUtil.error(res, "Subject not found", 404);
      }
      if (topicId) {
        const topic = await prisma.topic.findUnique({
          where: { id: topicId, subjectId },
        });
        if (!topic) {
          ResponseUtil.error(res, "Topic not found", 404);
        }
      }
      const jobId = uuid();
      const job: BulkUploadJob = {
        id: jobId,
        status: "pending",
        totalFiles: urls.length,
        processedFiles: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
        files: urls.map((url, index) => ({
          id: `${jobId}-file-${index}`,
          fileName: `image-${index}`,
          status: "pending" as const,
          url,
        })),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        subjectId,
        topicId: topicId || undefined,
        userId: req.user.id,
        gptModel,
      };
      await jobStorage.set(jobId, job);
      await jobStorage.addJobToQueue(jobId, 1);

      processFilesAsync(
        jobId,
        urls,
        subject,
        topicId,
        userId,
        gptModel,
        additionalInstructions
      );

      ResponseUtil.success(
        res,
        { job },
        "Bulk upload job created successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  getJobs = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const jobs = await jobStorage.getUserJobs(userId);
      ResponseUtil.success(res, jobs, "Jobs fetched successfully");
    } catch (error) {
      next(error);
    }
  };

  getJobStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        ResponseUtil.error(res, "Job ID is required", 400);
      }
      const jobWithMetadata = await jobStorage.getJobWithMetadata(jobId);
      if (!jobWithMetadata) {
        const payload = {
          id: jobId,
          status: "failed",
          totalFiles: 0,
          processedFiles: 0,
          successCount: 0,
          errorCount: 0,
          errors: [
            "Job not found or has expired. Jobs are automatically cleaned up after 24 hours.",
          ],
          files: [],
          createdAt: new Date().toISOString(),
          isExpired: true,
          message: "Job not found or expired",
        };
        ResponseUtil.error(res, "Job not found", 404, undefined, payload);
      }
      const job = jobWithMetadata;
      const payload = {
        id: job.id,
        status: job.status,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        successCount: job.successCount,
        errorCount: job.errorCount,
        errors: job.errors,
        files: job.files || [],
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        gptModel: job.gptModel,
        lastUpdated: job.lastUpdated,
        isExpired: job.isExpired,
        timeRemaining: job.timeRemaining,
        lastUpdatedAgo: job.lastUpdatedAgo,
        progressPercentage:
          job.totalFiles > 0
            ? Math.round((job.processedFiles / job.totalFiles) * 100)
            : 0,
      };
      ResponseUtil.success(res, payload, "Job status fetched successfully");
    } catch (error) {
      next(error);
    }
  };
  getBulkUploadHealth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const healthCheck = await jobStorage.healthCheck();
      const stats = await jobStorage.getJobStats();
      const queueLength = await jobStorage.getQueueLength();
      const payload = {
        redis: healthCheck,
        stats,
        queueLength,
        timestamp: new Date().toISOString(),
      };
      ResponseUtil.success(
        res,
        payload,
        "Bulk upload health fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}

async function processFilesAsync(
  jobId: string,
  urls: string[],
  subject: any,
  topicId: string | null,
  userId: string,
  gptModel: string,
  additionalInstructions: string
) {
  const job = await jobStorage.get(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found for processing`);
  }

  try {
    const healthCheck = await jobStorage.healthCheck();
    if (!healthCheck.connected) {
      console.error(
        "Redis connection failed, cannot process job:",
        healthCheck.error
      );
      await jobStorage.updateJobStatus(jobId, {
        status: "failed",
        errors: ["Redis connection failed during processing"],
      });
    }

    console.log(
      `Starting processing for job ${jobId} with ${urls.length} files using ${gptModel}`
    );
    await jobStorage.updateJobStatus(jobId, { status: "processing" });

    let subjectSubtopics = [] as { id: string; name: string }[];

    try {
      if (topicId) {
        subjectSubtopics = await prisma.subTopic.findMany({
          where: { topicId },
          select: { id: true, name: true },
        });
      } else {
        subjectSubtopics = await prisma.subTopic.findMany({
          where: { topic: { subjectId: subject.id } },
          select: { id: true, name: true },
        });
      }
    } catch (error) {
      console.error("Database error fetching subtopics:", error);
    }

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const fileId = job.files[i].id;

      try {
        console.log(`Processing file ${i + 1}/${urls.length}: ${url}`);

        // Update file status to processing with retry logic
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            await jobStorage.updateFileStatus(jobId, fileId, {
              status: "processing",
            });
            break;
          } catch (redisError) {
            retryCount++;
            console.error(
              `Redis update failed (attempt ${retryCount}/${maxRetries}):`,
              redisError
            );
            if (retryCount === maxRetries) {
              throw new Error(
                "Failed to update file status in Redis after multiple attempts"
              );
            }
            // Wait before retry
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
          }
        }

        const questionData = await processImageToQuestion(
          url,
          subject,
          topicId,
          subjectSubtopics,
          gptModel,
          additionalInstructions
        );

        if (questionData.success && questionData.data) {
          const questionId = await saveQuestionToDatabase(
            questionData.data,
            userId
          );
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: "completed",
            questionId,
            processedAt: new Date().toISOString(),
          });
          console.log(
            `Successfully processed file: ${url} -> Question ID: ${questionId}`
          );
        } else {
          const errorMessage = questionData.message || "Processing failed";
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: "failed",
            error: errorMessage,
          });
          console.error(`Failed to process file ${url}: ${errorMessage}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Error processing file ${url}:`, error);

        try {
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: "failed",
            error: errorMessage,
          });
        } catch (redisError) {
          console.error("Failed to update file status in Redis:", redisError);
          // Continue processing other files even if Redis update fails
        }
      }
    }

    // Mark job as completed
    const updatedJob = await jobStorage.get(jobId);
    if (updatedJob) {
      const finalStatus =
        updatedJob.errorCount === updatedJob.totalFiles
          ? "failed"
          : "completed";
      const completionTime = new Date().toISOString();

      await jobStorage.updateJobStatus(jobId, {
        status: finalStatus,
        completedAt: completionTime,
      });

      console.log(`Job ${jobId} completed with status: ${finalStatus}`);
      console.log(
        `Final stats: ${updatedJob.successCount} successful, ${updatedJob.errorCount} failed out of ${updatedJob.totalFiles} total files`
      );

      // Publish final completion notification
      await jobStorage.publishStatusUpdate(jobId, {
        ...updatedJob,
        status: finalStatus,
        completedAt: completionTime,
      });
    }
  } catch (error) {
    console.error(`Job ${jobId} processing failed:`, error);
    const errorMessage = `Job processing failed: ${error instanceof Error ? error.message : "Unknown error"}`;

    try {
      await jobStorage.updateJobStatus(jobId, {
        status: "failed",
        errors: [errorMessage],
        completedAt: new Date().toISOString(),
      });
    } catch (redisError) {
      console.error(
        "Failed to update job status in Redis after job failure:",
        redisError
      );
    }
  }
}

async function saveQuestionToDatabase(
  questionData: any,
  userId: string
): Promise<string> {
  try {
    console.log("\n=== Starting Question Processing ===");
    console.log("Initial Question Data:", {
      title: questionData.title,
      subtopicId: questionData.subtopicId,
      topicId: questionData.topicId,
      subjectId: questionData.subjectId,
    });

    // Validate relationships first
    if (questionData.subtopicId) {
      console.log("\nChecking Subtopic Relationship...");
      // Check if subtopic exists and belongs to the correct topic
      const subtopic = await prisma.subTopic.findUnique({
        where: { id: questionData.subtopicId },
        include: { topic: true },
      });

      console.log(
        "Found Subtopic:",
        subtopic
          ? {
              id: subtopic.id,
              name: subtopic.name,
              topicId: subtopic.topicId,
              topic: subtopic.topic
                ? {
                    id: subtopic.topic.id,
                    name: subtopic.topic.name,
                    subjectId: subtopic.topic.subjectId,
                  }
                : null,
            }
          : "Not found"
      );

      if (!subtopic) {
        throw new Error(`Subtopic ${questionData.subtopicId} not found`);
      }

      if (questionData.topicId && subtopic.topicId !== questionData.topicId) {
        throw new Error(
          `Subtopic ${questionData.subtopicId} does not belong to topic ${questionData.topicId}`
        );
      }

      // Set topicId from subtopic if not provided
      if (!questionData.topicId) {
        questionData.topicId = subtopic.topicId;
        console.log("Auto-set topicId from subtopic:", questionData.topicId);
      }

      // Set subjectId from topic if not provided
      if (!questionData.subjectId && subtopic.topic) {
        questionData.subjectId = subtopic.topic.subjectId;
        console.log("Auto-set subjectId from topic:", questionData.subjectId);
      }
    }

    if (questionData.topicId && !questionData.subtopicId) {
      console.log("\nChecking Topic Relationship...");
      // Check if topic exists and belongs to the correct subject
      const topic = await prisma.topic.findUnique({
        where: { id: questionData.topicId },
      });

      console.log(
        "Found Topic:",
        topic
          ? {
              id: topic.id,
              name: topic.name,
              subjectId: topic.subjectId,
            }
          : "Not found"
      );

      if (!topic) {
        throw new Error(`Topic ${questionData.topicId} not found`);
      }

      if (
        questionData.subjectId &&
        topic.subjectId !== questionData.subjectId
      ) {
        throw new Error(
          `Topic ${questionData.topicId} does not belong to subject ${questionData.subjectId}`
        );
      }

      // Set subjectId from topic if not provided
      if (!questionData.subjectId) {
        questionData.subjectId = topic.subjectId;
        console.log("Auto-set subjectId from topic:", questionData.subjectId);
      }
    }

    if (questionData.subjectId) {
      console.log("\nChecking Subject Relationship...");
      // Check if subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: questionData.subjectId },
      });

      console.log(
        "Found Subject:",
        subject
          ? {
              id: subject.id,
              name: subject.name,
            }
          : "Not found"
      );

      if (!subject) {
        throw new Error(`Subject ${questionData.subjectId} not found`);
      }
    }

    console.log("\nFinal Relationship IDs:", {
      subjectId: questionData.subjectId,
      topicId: questionData.topicId,
      subtopicId: questionData.subtopicId,
    });

    // Generate unique slug
    const baseSlug = questionData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.question.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log("Generated Slug:", slug);

    console.log("\nCreating Question with data:", {
      title: questionData.title,
      type: questionData.type || "MCQ",
      format: questionData.format || "TEXT",
      difficulty: questionData.difficulty || 1,
      optionsCount: questionData.options?.length || 0,
      categoriesCount: questionData.categories?.length || 0,
    });

    // Create question with options
    const createdQuestion = await prisma.question.create({
      data: {
        slug,
        title: questionData.title,
        content: questionData.content,
        type: questionData.type || "MCQ",
        format: questionData.format || "TEXT",
        difficulty: questionData.difficulty || 1,
        subjectId: questionData.subjectId,
        topicId: questionData.topicId,
        subtopicId: questionData.subtopicId,
        solution: questionData.solution,
        hint: questionData.hint,
        strategy: questionData.strategy,
        questionTime: (questionData.questionTime || 2) * 60, // Convert to seconds, default 2 minutes
        isNumerical: questionData.isNumerical || null,
        commonMistake: questionData.commonMistake,
        book: questionData.book,
        pyqYear: questionData.pyqYear,
        isPublished: false, // Keep as draft initially
        createdBy: userId,
        options: {
          create:
            questionData.options?.map((option: any) => ({
              content: option.content,
              isCorrect: option.isCorrect || false,
            })) || [],
        },
        category: {
          create:
            questionData.categories?.map((category: string) => ({
              category,
            })) || [],
        },
      },
    });

    return createdQuestion.id;
  } catch (error) {
    console.error("Error saving question:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to save question"
    );
  }
}
