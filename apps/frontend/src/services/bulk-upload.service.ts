import api from "@/utils/api";

export interface BulkUploadJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  createdAt: string;
  completedAt?: string;
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
  } catch (error) {
    console.error("Error fetching bulk upload status:", error);
    return {
      success: false,
      message: "Error fetching status",
      data: {
        id: jobId,
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        successCount: 0,
        errorCount: 0,
        errors: ['Failed to fetch status'],
        createdAt: new Date().toISOString(),
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
