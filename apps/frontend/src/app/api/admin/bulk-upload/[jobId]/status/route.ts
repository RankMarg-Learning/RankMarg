import { NextRequest } from 'next/server';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import { jobStorage } from '@/lib/redis-job-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return jsonResponse(null, {
        success: false,
        message: 'Unauthorized',
        status: 401,
      });
    }

    const { jobId } = params;
    
    if (!jobId) {
      return jsonResponse(null, {
        success: false,
        message: 'Job ID is required',
        status: 400,
      });
    }

    const jobWithMetadata = await jobStorage.getJobWithMetadata(jobId);
    
    if (!jobWithMetadata) {
      // Check if job was deleted or never existed
      console.log(`Job ${jobId} not found - may have expired or been deleted`);
      
      return jsonResponse({
        id: jobId,
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        successCount: 0,
        errorCount: 0,
        errors: ['Job not found or has expired. Jobs are automatically cleaned up after 24 hours.'],
        files: [],
        createdAt: new Date().toISOString(),
        isExpired: true,
        message: 'Job not found or expired'
      }, {
        success: false,
        message: 'Job not found or expired',
        status: 404,
      });
    }

    const job = jobWithMetadata;

    // Check if user owns this job
    if (job.userId !== session.user.id) {
      return jsonResponse(null, {
        success: false,
        message: 'Access denied',
        status: 403,
      });
    }

    return jsonResponse({
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
      // Add progress percentage for better UX
      progressPercentage: job.totalFiles > 0 ? Math.round((job.processedFiles / job.totalFiles) * 100) : 0,
    }, {
      success: true,
      message: 'Job status retrieved successfully',
      status: 200,
    });

  } catch (error) {
    console.error('[BulkUpload] Status Error:', error);
    return jsonResponse(null, {
      success: false,
      message: 'Internal server error',
      status: 500,
    });
  }
}
