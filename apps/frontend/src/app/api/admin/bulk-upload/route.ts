import { NextRequest } from 'next/server';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { processImageToQuestion } from '@/services/ai/gpt-vision.service';
import { jobStorage, type BulkUploadJob } from '@/lib/redis-job-storage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return jsonResponse(null, {
        success: false,
        message: 'Unauthorized',
        status: 401,
      });
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const subjectId = formData.get('subjectId') as string;
    const topicId = formData.get('topicId') as string | null;
    const gptModel = formData.get('gptModel') as string || 'gpt-4o-mini';
    const urls = formData.getAll('urls') as string[];
    const additionalInstructions = formData.get('additionalInstructions') as string || '';

    if (!subjectId) {
      return jsonResponse(null, {
        success: false,
        message: 'Subject ID is required',
        status: 400,
      });
    }

    if (urls.length === 0) {
      return jsonResponse(null, { success: false, message: 'At least one URL is required', status: 400 });
    }

    // Validate subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { topics: true }
    });

    if (!subject) {
      return jsonResponse(null, {
        success: false,
        message: 'Subject not found',
        status: 404,
      });
    }

    // Validate topic if provided
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId, subjectId }
      });

      if (!topic) {
        return jsonResponse(null, {
          success: false,
          message: 'Topic not found or does not belong to the selected subject',
          status: 404,
        });
      }
    }

    // Create job
    const jobId = uuidv4();
    const job: BulkUploadJob = {
      id: jobId,
      status: 'pending',
      totalFiles: urls.length,
      processedFiles: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      files: urls.map((url, index) => ({
        id: `${jobId}-file-${index}`,
        fileName: `image-${index}`,
        status: 'pending' as const,
        url
      })),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      subjectId,
      topicId: topicId || undefined,
      userId,
      gptModel,
    };

    await jobStorage.set(jobId, job);

    // Add job to Redis processing queue
    await jobStorage.addJobToQueue(jobId, 1); // Priority 1 for user jobs

    // Process files asynchronously
    processFilesAsync(jobId, urls, subject, topicId, userId, gptModel, additionalInstructions);

    return jsonResponse({
      job: {
        id: job.id,
        status: job.status,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        successCount: job.successCount,
        errorCount: job.errorCount,
        errors: job.errors,
        createdAt: job.createdAt,
      }
    }, {
      success: true,
      message: 'Bulk upload job started',
      status: 200,
    });

  } catch (error) {
    console.error('[BulkUpload] Error:', error);
    return jsonResponse(null, {
      success: false,
      message: 'Internal server error',
      status: 500,
    });
  }
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
    return;
  }

  try {
    const healthCheck = await jobStorage.healthCheck();
    if (!healthCheck.connected) {
      console.error('Redis connection failed, cannot process job:', healthCheck.error);
      await jobStorage.updateJobStatus(jobId, { 
        status: 'failed',
        errors: ['Redis connection failed during processing']
      });
      return;
    }

    console.log(`Starting processing for job ${jobId} with ${urls.length} files using ${gptModel}`);
    await jobStorage.updateJobStatus(jobId, { status: 'processing' });

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
      console.error('Database error fetching subtopics:', error);
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
            await jobStorage.updateFileStatus(jobId, fileId, { status: 'processing' });
            break;
          } catch (redisError) {
            retryCount++;
            console.error(`Redis update failed (attempt ${retryCount}/${maxRetries}):`, redisError);
            if (retryCount === maxRetries) {
              throw new Error('Failed to update file status in Redis after multiple attempts');
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
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
          const questionId = await saveQuestionToDatabase(questionData.data, userId);
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: 'completed',
            questionId,
            processedAt: new Date().toISOString()
          });
          console.log(`Successfully processed file: ${url} -> Question ID: ${questionId}`);
        } else {
          const errorMessage = questionData.message || 'Processing failed';
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: 'failed',
            error: errorMessage
          });
          console.error(`Failed to process file ${url}: ${errorMessage}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing file ${url}:`, error);
        
        try {
          await jobStorage.updateFileStatus(jobId, fileId, {
            status: 'failed',
            error: errorMessage
          });
        } catch (redisError) {
          console.error('Failed to update file status in Redis:', redisError);
          // Continue processing other files even if Redis update fails
        }
      }
    }

    // Mark job as completed
    const updatedJob = await jobStorage.get(jobId);
    if (updatedJob) {
      const finalStatus = updatedJob.errorCount === updatedJob.totalFiles ? 'failed' : 'completed';
      const completionTime = new Date().toISOString();
      
      await jobStorage.updateJobStatus(jobId, {
        status: finalStatus,
        completedAt: completionTime
      });

      console.log(`Job ${jobId} completed with status: ${finalStatus}`);
      console.log(`Final stats: ${updatedJob.successCount} successful, ${updatedJob.errorCount} failed out of ${updatedJob.totalFiles} total files`);
      
      // Publish final completion notification
      await jobStorage.publishStatusUpdate(jobId, {
        ...updatedJob,
        status: finalStatus,
        completedAt: completionTime
      });
    }

  } catch (error) {
    console.error(`Job ${jobId} processing failed:`, error);
    const errorMessage = `Job processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    try {
      await jobStorage.updateJobStatus(jobId, {
        status: 'failed',
        errors: [errorMessage],
        completedAt: new Date().toISOString()
      });
    } catch (redisError) {
      console.error('Failed to update job status in Redis after job failure:', redisError);
    }
  }
}

async function saveQuestionToDatabase(questionData: any, userId: string): Promise<string> {
  try {
    console.log('\n=== Starting Question Processing ===');
    console.log('Initial Question Data:', {
      title: questionData.title,
      subtopicId: questionData.subtopicId,
      topicId: questionData.topicId,
      subjectId: questionData.subjectId
    });

    // Validate relationships first
    if (questionData.subtopicId) {
      console.log('\nChecking Subtopic Relationship...');
      // Check if subtopic exists and belongs to the correct topic
      const subtopic = await prisma.subTopic.findUnique({
        where: { id: questionData.subtopicId },
        include: { topic: true }
      });

      console.log('Found Subtopic:', subtopic ? {
        id: subtopic.id,
        name: subtopic.name,
        topicId: subtopic.topicId,
        topic: subtopic.topic ? {
          id: subtopic.topic.id,
          name: subtopic.topic.name,
          subjectId: subtopic.topic.subjectId
        } : null
      } : 'Not found');

      if (!subtopic) {
        throw new Error(`Subtopic ${questionData.subtopicId} not found`);
      }

      if (questionData.topicId && subtopic.topicId !== questionData.topicId) {
        throw new Error(`Subtopic ${questionData.subtopicId} does not belong to topic ${questionData.topicId}`);
      }

      // Set topicId from subtopic if not provided
      if (!questionData.topicId) {
        questionData.topicId = subtopic.topicId;
        console.log('Auto-set topicId from subtopic:', questionData.topicId);
      }

      // Set subjectId from topic if not provided
      if (!questionData.subjectId && subtopic.topic) {
        questionData.subjectId = subtopic.topic.subjectId;
        console.log('Auto-set subjectId from topic:', questionData.subjectId);
      }
    }

    if (questionData.topicId && !questionData.subtopicId) {
      console.log('\nChecking Topic Relationship...');
      // Check if topic exists and belongs to the correct subject
      const topic = await prisma.topic.findUnique({
        where: { id: questionData.topicId }
      });

      console.log('Found Topic:', topic ? {
        id: topic.id,
        name: topic.name,
        subjectId: topic.subjectId
      } : 'Not found');

      if (!topic) {
        throw new Error(`Topic ${questionData.topicId} not found`);
      }

      if (questionData.subjectId && topic.subjectId !== questionData.subjectId) {
        throw new Error(`Topic ${questionData.topicId} does not belong to subject ${questionData.subjectId}`);
      }

      // Set subjectId from topic if not provided
      if (!questionData.subjectId) {
        questionData.subjectId = topic.subjectId;
        console.log('Auto-set subjectId from topic:', questionData.subjectId);
      }
    }

    if (questionData.subjectId) {
      console.log('\nChecking Subject Relationship...');
      // Check if subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: questionData.subjectId }
      });

      console.log('Found Subject:', subject ? {
        id: subject.id,
        name: subject.name
      } : 'Not found');

      if (!subject) {
        throw new Error(`Subject ${questionData.subjectId} not found`);
      }
    }

    console.log('\nFinal Relationship IDs:', {
      subjectId: questionData.subjectId,
      topicId: questionData.topicId,
      subtopicId: questionData.subtopicId
    });

    // Generate unique slug
    const baseSlug = questionData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.question.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    console.log('Generated Slug:', slug);

    console.log('\nCreating Question with data:', {
      title: questionData.title,
      type: questionData.type || 'MCQ',
      format: questionData.format || 'TEXT',
      difficulty: questionData.difficulty || 1,
      optionsCount: questionData.options?.length || 0,
      categoriesCount: questionData.categories?.length || 0
    });

    // Create question with options
    const createdQuestion = await prisma.question.create({
      data: {
        slug,
        title: questionData.title,
        content: questionData.content,
        type: questionData.type || 'MCQ',
        format: questionData.format || 'TEXT',
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
          create: questionData.options?.map((option: any) => ({
            content: option.content,
            isCorrect: option.isCorrect || false,
          })) || [],
        },
        category: {
          create: questionData.categories?.map((category: string) => ({
            category,
          })) || [],
        },
      },
    });

    return createdQuestion.id;
  } catch (error) {
    console.error('Error saving question:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save question');
  }
}

// Get job status
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return jsonResponse(null, {
        success: false,
        message: 'Unauthorized',
        status: 401,
      });
    }

    // Return all jobs for the user
    const userJobs = await jobStorage.getUserJobs(session.user.id);

    return jsonResponse({ jobs: userJobs }, {
      success: true,
      message: 'Jobs retrieved successfully',
      status: 200,
    });

  } catch (error) {
    console.error('[BulkUpload] GET Error:', error);
    return jsonResponse(null, {
      success: false,
      message: 'Internal server error',
      status: 500,
    });
  }
}
