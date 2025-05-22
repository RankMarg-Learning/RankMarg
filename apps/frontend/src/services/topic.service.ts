import api from "@/utils/api";

export const getTopics = async (subjectId?: string) => {
  try {
    const response = await api.get(`/topics?subjectId=${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics:", error);
    return {
      success: false,
      message: "Error fetching topics",
    };

  }

};

export const addTopic = async (name: string, subjectId: string, weightage: number) => {
  try {
    const response = await api.post('/topics', { name, subjectId, weightage });
    return response.data;
  } catch (error) {
    console.error("Error adding topic:", error);
    return {
      success: false,
      message: "Error adding topic",
    };

  }

};

export const updateTopic = async (id: string, name: string, subjectId: string, weightage: number) => {
  try {
    const response = await api.put(`/topics/${id}`, { name, subjectId, weightage });
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
