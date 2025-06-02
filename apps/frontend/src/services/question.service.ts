import { Question } from "@/types/typeAdmin";
import api from "@/utils/api";

export const getAllQuestions = async () => {
  try {
    const response = await api.get('/question?isPublished=true');
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return {
      success: false,
      message: "Error fetching questions",
    }
    
  }
  
};

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
    
  } catch (error) {
    console.error("Error adding question:", error);
    return {
      success: false,
      message: "Error adding question",
    }
    
  }
  
};

export const updateQuestion = async (id: string, question: Partial<Question>) => {
  try {
    const response = await api.put(`/question/${id}`, question);
    return response.data;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error updating question",
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
