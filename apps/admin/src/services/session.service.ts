import api from "@/utils/api";

// Get AI Practice Sessions API
export const getAiPracticeSession = async (sessionId: string) => {
    try {
        const response = await api.get(`/practice-sessions/ai/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI practice sessions:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Error fetching AI practice sessions",
        };
    }
}

export const getAllAiPracticeSession = async (userId: string, sessionCount?: number) => {
    try {
        const response = await api.get(`/practice-sessions/ai?userId=${userId}&sessionCount=${sessionCount}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI practice sessions:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Error fetching AI practice sessions",
        };
    }
}