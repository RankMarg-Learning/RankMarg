import api from "@/utils/api";

export interface FileProcessingStatus {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  questionId?: string;
  processedAt?: string;
}

export interface BulkUploadJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  files: FileProcessingStatus[];
  createdAt: string;
  completedAt?: string;
  gptModel?: string;
  lastUpdated: string;
  isExpired?: boolean;
  timeRemaining?: number;
  lastUpdatedAgo?: number;
  progressPercentage?: number;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data?: {
    job: BulkUploadJob;
  };
}

export interface BulkUploadStatusResponse {
  success: boolean;
  message: string;
  data: BulkUploadJob;
}

export const bulkUploadQuestions = async (formData: FormData): Promise<BulkUploadResponse> => {
  try {
    const response = await api.post('/admin/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading bulk questions:", error);
    return {
      success: false,
      message: "Error uploading questions",
    };
  }
};

export const getBulkUploadStatus = async (jobId: string): Promise<BulkUploadStatusResponse> => {
  try {
    const response = await api.get(`/admin/bulk-upload/${jobId}/status`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching bulk upload status:", error);
    
    // Handle different error types
    const errorMessage = error?.response?.status === 404 
      ? "Job not found or has expired. Jobs are automatically cleaned up after 24 hours."
      : error?.response?.status === 403
      ? "Access denied to this job"
      : error?.response?.data?.message || "Failed to fetch job status";

    return {
      success: false,
      message: errorMessage,
      data: {
        id: jobId,
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        successCount: 0,
        errorCount: 0,
        errors: [errorMessage],
        files: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isExpired: error?.response?.status === 404,
      }
    };
  }
};

export const getAllBulkUploadJobs = async () => {
  try {
    const response = await api.get('/admin/bulk-upload/jobs');
    return response.data;
  } catch (error) {
    console.error("Error fetching bulk upload jobs:", error);
    return {
      success: false,
      message: "Error fetching jobs",
    };
  }
};

export const getBulkUploadHealth = async () => {
  try {
    const response = await api.get('/admin/bulk-upload/health');
    return response.data;
  } catch (error) {
    console.error("Error fetching bulk upload health:", error);
    return {
      success: false,
      message: "Error fetching health status",
      data: {
        redis: { connected: false, error: "API call failed" },
        stats: { totalJobs: 0, activeJobs: 0, completedJobs: 0, failedJobs: 0, totalUsers: 0 },
        queueLength: 0,
        timestamp: new Date().toISOString()
      }
    };
  }
};
