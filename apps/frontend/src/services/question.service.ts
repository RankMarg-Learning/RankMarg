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
    
  } catch (error) {
    console.error("Error adding question:", error);
    return {
      success: false,
      message: "Error adding question",
    }
    
  }
  
};

export const updateQuestion = async (slug: string, question: Partial<Question>) => {
  console.log("question", question);
  console.log("id", slug);
  try {
    const response = await api.put(`/question/${slug}`, question);
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
