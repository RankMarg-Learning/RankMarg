import api from "@/utils/api";

export const getSubjects = async (examCode?: string) => {
  try {
    const response = await api.get(`/subjects?examCode=${examCode}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return {
      success: false,
      message: "Error fetching subjects",
    };

  }

};

export const addSubject = async (name: string, shortName?: string) => {
  try {
    const response = await api.post('/subjects', { name, shortName });
    return response.data;
  } catch (error) {
    console.error("Error adding subject:", error);
    return {
      success: false,
      message: "Error adding subject",
    };

  }

};

export const updateSubject = async (id: string, name: string, shortName?: string) => {
  try {
    const response = await api.put(`/subjects/${id}`, { name, shortName });
    return response.data;
  } catch (error) {
    console.error("Error updating subject:", error);
    return {
      success: false,
      message: "Error updating subject",
    };

  }

};

export const deleteSubject = async (id: string) => {
  try {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;

  } catch (error) {
    console.error("Error deleting subject:", error);
    return {
      success: false,
      message: "Error deleting subject",
    };

  }
};
