import api from "@/utils/api";

export const getTopics = async (subjectId?: string) => {
  try {
    const url = subjectId ? `/topics?subjectId=${subjectId}` : '/topics';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics:", error);
    return {
      success: false,
      message: "Error fetching topics",
    };

  }

};

export const addTopic = async (name: string, subjectId: string, weightage: number, slug?: string, orderIndex?: number, estimatedMinutes?: number) => {
  try {
    const response = await api.post('/topics', { name, subjectId, weightage, slug, orderIndex, estimatedMinutes });
    return response.data;
  } catch (error) {
    console.error("Error adding topic:", error);
    return {
      success: false,
      message: "Error adding topic",
    };

  }

};

export const updateTopic = async (id: string, name: string, subjectId: string, weightage: number, slug?: string, orderIndex?: number, estimatedMinutes?: number) => {
  try {
    const response = await api.put(`/topics/${id}`, { name, subjectId, weightage, slug, orderIndex, estimatedMinutes });
    return response.data;

  } catch (error) {
    console.error("Error updating topic:", error);
    return {
      success: false,
      message: "Error updating topic",
    };

  }

};

export const deleteTopic = async (id: string) => {
  try {

    const response = await api.delete(`/topics/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting topic:", error);
    return {
      success: false,
      message: "Error deleting topic",
    };

  }
};
