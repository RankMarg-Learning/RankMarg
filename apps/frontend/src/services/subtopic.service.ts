import api from "@/utils/api";

export const getSubtopics = async (topicId?: string) => {
  try {
    const url = topicId ? `/subtopics?topicId=${topicId}` : '/subtopics';
    const response = await api.get(url);
    return response.data;

  } catch (error) {
    console.error("Error fetching subtopics:", error);
    return {
      success: false,
      message: "Error fetching subtopics",
    };

  }

};

export const addSubtopic = async (name: string, topicId: string, slug?: string, orderIndex?: number, estimatedMinutes?: number, weightage?: number) => {
  try {
    const response = await api.post('/subtopics', { name, topicId, slug, orderIndex, estimatedMinutes, weightage });
    return response.data;

  } catch (error) {
    console.error("Error adding subtopic:", error);
    return {
      success: false,
      message: "Error adding subtopic",
    };

  }

};

export const updateSubtopic = async (id: string, name: string, topicId: string, slug?: string, orderIndex?: number, estimatedMinutes?: number, weightage?: number) => {
  try {
    const response = await api.put(`/subtopics/${id}`, { name, topicId, slug, orderIndex, estimatedMinutes, weightage });
    return response.data;

  } catch (error) {
    console.error("Error updating subtopic:", error);
    return {
      success: false,
      message: "Error updating subtopic",
    };

  }

};

export const deleteSubtopic = async (id: string) => {
  try {
    const response = await api.delete(`/subtopics/${id}`);
    return response.data;

  } catch (error) {
    console.error("Error deleting subtopic:", error);
    return {
      success: false,
      message: "Error deleting subtopic",
    };

  }
};
