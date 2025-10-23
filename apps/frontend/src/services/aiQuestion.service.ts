import api from "@/utils/api";

interface QuestionOption {
  id: string;
  content: string;
}

export interface AIQuestion {
  id: string;
  slug: string;
  title: string;
  content: string;
  type: string;
  format: string;
  difficulty: number;
  questionTime: number;
  hint?: string | null;
  strategy?: string | null;
  commonMistake?: string | null;
  pyqYear?: string | null;
  options: QuestionOption[];
  topic: {
    name: string;
    slug: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
  categories: string[];
}

export interface AIQuestionPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AIQuestionMetadata {
  topicName: string;
  subjectName: string;
  userGrade: string;
  difficultyRange: {
    min: number;
    max: number;
  };
  questionsAttempted: number;
}

export interface AIQuestionsResponse {
  questions: AIQuestion[];
  pagination: AIQuestionPagination;
  metadata: AIQuestionMetadata;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string | null;
  questionCount: number;
  topicCount: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string | null;
  weightage: number;
  orderIndex: number;
  estimatedMinutes: number | null;
  questionCount: number;
}

export interface UserAIStats {
  userGrade: string;
  totalAttempted: number;
  correctAttempts: number;
  accuracy: number;
  uniqueQuestionsAttempted: number;
}

class AIQuestionService {
  private readonly BASE_PATH = "/ai-questions";

  /**
   * Get all subjects available for AI questions
   */
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/subjects`
      );
      return response.data.data.subjects as Subject[];
    } catch (error) {
      console.error("Error fetching AI question subjects:", error);
      throw error;
    }
  }

  /**
   * Get topics for a specific subject
   */
  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/subjects/${subjectId}/topics`
      );
      return response.data.data.topics as Topic[];
    } catch (error) {
      console.error("Error fetching topics:", error);
      throw error;
    }
  }

  /**
   * Get AI questions by topic slug
   */
  async getQuestionsByTopic(
    topicSlug: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/topic/${topicSlug}`,
        {
          params: { page, limit },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching AI questions:", error);
      throw error;
    }
  }

  
}

export const aiQuestionService = new AIQuestionService();

