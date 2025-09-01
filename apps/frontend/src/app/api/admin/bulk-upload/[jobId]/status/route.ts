import { NextRequest } from 'next/server';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import { jobStorage } from '@/lib/bulk-upload-jobs';

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

    const job = jobStorage.get(jobId);
    
    if (!job) {
      // Return a more specific error message
      return jsonResponse({
        id: jobId,
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        successCount: 0,
        errorCount: 0,
        errors: ['Job not found or expired'],
        createdAt: new Date().toISOString(),
      }, {
        success: true,
        message: 'Job status retrieved',
        status: 200, // Return 200 even for not found jobs to handle gracefully on frontend
      });
    }

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
      createdAt: job.createdAt,
      completedAt: job.completedAt,
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
