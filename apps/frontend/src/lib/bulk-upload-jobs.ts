// Shared job storage for bulk upload operations
// In production, this should be replaced with Redis or a database

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
  subjectId: string;
  topicId?: string;
  userId: string;
}

class JobStorage {
  private jobs = new Map<string, BulkUploadJob>();

  set(jobId: string, job: BulkUploadJob) {
    this.jobs.set(jobId, job);
  }

  get(jobId: string): BulkUploadJob | undefined {
    return this.jobs.get(jobId);
  }

  getAll(): BulkUploadJob[] {
    return Array.from(this.jobs.values());
  }

  getUserJobs(userId: string): BulkUploadJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  delete(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  clear() {
    this.jobs.clear();
  }
}

// Export a singleton instance
export const jobStorage = new JobStorage();
