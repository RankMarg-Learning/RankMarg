import { Question, QuestionFilter } from "@/types/typeAdmin";
import api from "@/utils/api";

export const getAllQuestions = async () => {
  try {
    const response = await api.get('/question');
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return {
      success: false,
      message: "Error fetching questions",
    }
    
  }
  
};

export const getQuestionByFilter = async (filter: Partial<QuestionFilter>) => {
  try {
    const response = await api.get('/question', { params: filter });
    return response.data;
    
  } catch (error) {
    console.error("Error fetching questions by filter:", error);
    return {
      success: false,
      message: "Error fetching questions",
    }
    
  }
}

export const getQuestionBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/question/${slug}`);
    return response.data;
    
  } catch (error) {
    console.error("Error fetching question by slug:", error);
    return {
      success: false,
      message: "Error fetching question",
    }
    
  }
  
};

export const addQuestions = async (question: Partial<Question>) => {
  try {
    const response = await api.post('/question', question);
    return response.data;
  } catch (error: any) {
    console.error("Error adding question:", error);
    
    // Extract error message from response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Error adding question";
    
    return {
      success: false,
      message: errorMessage,
    }
  }
};

export const updateQuestion = async (slug: string, question: Partial<Question>) => {
  console.log("question", question);
  console.log("id", slug);
  try {
    const response = await api.put(`/question/${slug}`, question);
    return response.data;
  } catch (error: any) {
    console.error("Update question error:", error);
    
    // Extract error message from response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Error updating question";
    
    return {
      success: false,
      message: errorMessage,
    }
  }
};

export const deleteQuestion = async (slug: string) => {
  try {
    const response = await api.delete(`/question/${slug}`);
    return response.data;
    
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Error deleting question",
    };
  }
};

export const reportQuestion = async (
  slug: string,
  payload: { type: string; feedback: string }
) => {
  try {
    const response = await api.post(`/question/${slug}/report`, payload);
    return response.data;
  } catch (error) {
    console.error("Error reporting question:", error);
    return {
      success: false,
      message: "Error reporting question",
    };
  }
};

export const getReportQuestions = async (filter: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}) => {
  try {
    const response = await api.get('/question/reports/all', { params: filter });
    return response.data;
  } catch (error) {
    console.error("Error fetching report questions:", error);
    return {
      success: false,
      message: "Error fetching report questions",
    };
  }
};

export const getReportsByQuestionSlug = async (slug: string, filter: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get(`/question/reports/slug/${slug}`, { params: filter });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports by question slug:", error);
    return {
      success: false,
      message: "Error fetching reports by question slug",
    };
  }
};

export const getReportQuestionById = async (id: string) => {
  try {
    const response = await api.get(`/question/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report question:", error);
    return {
      success: false,
      message: "Error fetching report question",
    };
  }
};

export const deleteReportQuestion = async (id: string) => {
  try {
    const response = await api.delete(`/question/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting report question:", error);
    return {
      success: false,
      message: "Error deleting report question",
    };
  }
};