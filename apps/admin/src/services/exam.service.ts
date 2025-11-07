import api from "@/utils/api";

export const getExams = async () => {
  try {
    const response = await api.get('/exams');
    return response.data;
  } catch (error) {
    console.error("Error fetching exams:", error);
    return {
      success: false,
      message: "Error fetching exams",
    };
  }
};

export const addExam = async (exam: {
  code: string;
  name: string;
  fullName?: string;
  description?: string;
  category?: string;
  minDifficulty: number;
  maxDifficulty: number;
  totalMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarkingRatio?: number;
  isActive: boolean;
  registrationStartAt?: string;
  registrationEndAt?: string;
  examDate?: string;
}) => {
  try {
    const response = await api.post('/exams', exam);
    return response.data;
  } catch (error) {
    console.error("Error adding exam:", error);
    return {
      success: false,
      message: "Error adding exam",
    };
  }
};

export const updateExam = async (id: string, exam: Partial<{
  code: string;
  name: string;
  fullName: string;
  description: string;
  category: string;
  minDifficulty: number;
  maxDifficulty: number;
  totalMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarkingRatio: number;
  isActive: boolean;
  registrationStartAt: string;
  registrationEndAt: string;
  examDate: string;
}>) => {
  try {
    const response = await api.put(`/exams/${id}`, exam);
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    return {
      success: false,
      message: "Error updating exam",
    };
  }
};

export const deleteExam = async (id: string) => {
  try {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting exam:", error);
    return {
      success: false,
      message: "Error deleting exam",
    };
  }
};

export const addSubjectToExam = async (examId: string, subjectId: string, weightage: number) => {
  try {
    const response = await api.post(`/exams/${examId}/subjects`, { subjectId, weightage });
    return response.data;
  } catch (error) {
    console.error("Error adding subject to exam:", error);
    return {
      success: false,
      message: "Error adding subject to exam",
    };
  }
};

export const removeSubjectFromExam = async (examId: string, subjectId: string) => {
  try {
    const response = await api.delete(`/exams/${examId}/subjects?subjectId=${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing subject from exam:", error);
    return {
      success: false,
      message: "Error removing subject from exam",
    };
  }
};
