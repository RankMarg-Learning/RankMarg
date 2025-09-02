import { NextRequest } from 'next/server';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import { jobStorage } from '@/lib/redis-job-storage';

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

    // Check Redis health
    const healthCheck = await jobStorage.healthCheck();
    
    // Get job statistics
    const stats = await jobStorage.getJobStats();
    
    // Get queue length
    const queueLength = await jobStorage.getQueueLength();

    const healthData = {
      redis: healthCheck,
      stats,
      queueLength,
      timestamp: new Date().toISOString()
    };

    return jsonResponse(healthData, {
      success: true,
      message: 'Health check completed',
      status: 200,
    });

  } catch (error) {
    console.error('[BulkUpload] Health Check Error:', error);
    return jsonResponse({
      redis: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      stats: {
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        totalUsers: 0
      },
      queueLength: 0,
      timestamp: new Date().toISOString()
    }, {
      success: false,
      message: 'Health check failed',
      status: 500,
    });
  }
}
