import { NextRequest } from 'next/server';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { processImageToQuestion } from '@/services/ai/gpt-vision.service';
import { getSubtopics } from '@/services/subtopic.service';
import { jobStorage, type BulkUploadJob } from '@/lib/bulk-upload-jobs';

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
    const files = formData.getAll('files') as File[];

    if (!subjectId) {
      return jsonResponse(null, {
        success: false,
        message: 'Subject ID is required',
        status: 400,
      });
    }

    if (files.length === 0) {
      return jsonResponse(null, {
        success: false,
        message: 'At least one file is required',
        status: 400,
      });
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
      totalFiles: files.length,
      processedFiles: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdAt: new Date().toISOString(),
      subjectId,
      topicId: topicId || undefined,
      userId,
    };

    jobStorage.set(jobId, job);

    // Process files asynchronously
    processFilesAsync(jobId, files, subject, topicId, userId);

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
  files: File[], 
  subject: any, 
  topicId: string | null,
  userId: string
) {
  const job = jobStorage.get(jobId);
  if (!job) return;

  try {
    job.status = 'processing';
    jobStorage.set(jobId, job);

    let subjectSubtopics = []; 
    try {
      const subtopicsData = await getSubtopics(topicId);

      if (subtopicsData && Array.isArray(subtopicsData?.data)) {
        subjectSubtopics = subtopicsData?.data.map((st: any) => ({id: st.id, name: st.name}));
      }
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    }


    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        const questionData = await processImageToQuestion(
          base64Image,
          file.type,
          subject,
          topicId,
          subjectSubtopics
        );

        if (questionData.success && questionData.data) {
          await saveQuestionToDatabase(questionData.data, userId);
          job.successCount++;
        } else {
          job.errorCount++;
          job.errors.push(`File ${file.name}: ${questionData.message || 'Processing failed'}`);
        }

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        job.errorCount++;
        job.errors.push(`File ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      job.processedFiles++;
      jobStorage.set(jobId, job);
    }

    // Mark job as completed
    job.status = job.errorCount === job.totalFiles ? 'failed' : 'completed';
    job.completedAt = new Date().toISOString();
    jobStorage.set(jobId, job);

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    job.status = 'failed';
    job.errors.push(`Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    jobStorage.set(jobId, job);
  }
}

async function saveQuestionToDatabase(questionData: any, userId: string) {
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
    await prisma.question.create({
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
    const userJobs = jobStorage.getUserJobs(session.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
