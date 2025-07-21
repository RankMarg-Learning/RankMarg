export interface AgentResponseDB {
  studentId: string;
  startDate: Date;
  endDate: Date;
  subtopics: {
    name: string;
    incorrect_count: number;
    avg_timing: number;
    avg_hints_used: number;
    study_materials: string[];
    tips: string[];
  }[];
  overall_strategies: string[];
  metadata: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    generatedAt: Date;
    version: string;
  };
}

export interface AgentConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface AgentMetrics {
  totalProcessed: number;
  successful: number;
  failed: number;
  totalTokensUsed: number;
  totalCost: number;
  processingTime: number;
  errors: AgentError[];
}

export interface AgentError {
  studentId: string;
  error: string;
  timestamp: Date;
  retryCount: number;
}
export interface AgentProcessingOptions {
  studentId: string;
  startDate: Date;
  endDate: Date;
  forceReprocess?: boolean;
}
export interface BatchProcessingOptions {
  batchSize: number;
  offset: number;
  concurrency?: number;
  skipRecentlyProcessed?: boolean;
  hoursThreshold?: number;
}
