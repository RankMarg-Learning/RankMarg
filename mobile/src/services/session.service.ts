import api from "@/utils/api";

// Get AI Practice Session by ID
export const getAiPracticeSession = async (sessionId: string) => {
  try {
    const response = await api.get(`/practice-sessions/ai/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error("[mobile] Error fetching AI practice session:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message || "Error fetching AI practice session",
    };
  }
};

// Get all AI Practice Sessions for a user
export const getAllAiPracticeSession = async (
  userId: string,
  sessionCount?: number
) => {
  try {
    const response = await api.get(
      `/practice-sessions/ai?userId=${userId}&sessionCount=${sessionCount}`
    );
    return response.data;
  } catch (error: any) {
    console.error("[mobile] Error fetching AI practice sessions:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message || "Error fetching AI practice sessions",
    };
  }
};

// Add Attempt (SESSION/TEST)
export const addAttempt = async ({
  attemptData,
  attemptType,
  id,
}: {
  attemptData: Partial<{
    questionId: string;
    isCorrect?: boolean;
    answer?: string | number | null;
    timing?: number;
    reactionTime?: number;
    isHintUsed?: boolean;
  }>;
  attemptType?: "SESSION" | "TEST" | "NONE";
  id?: string;
}) => {
  try {
    const payload = {
      ...attemptData,
      id,
    };
    const response = await api.post(
      `/attempts?type=${attemptType || "NONE"}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("[mobile] Error adding attempt:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Error adding attempt",
    };
  }
};


