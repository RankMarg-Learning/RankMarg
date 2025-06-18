import api from "@/utils/api";

// Get AI Practice Sessions API
export const getAiPracticeSession = async (sessionId: string) => {
    const version = process.env.VERSION || '/v.1.0'
    try {
        const response = await api.get(`${version}/ai-session/${sessionId}`);
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
    const version = process.env.VERSION || '/v.1.0'
    try {
        const response = await api.get(`${version}/ai-practice?userId=${userId}&sessionCount=${sessionCount}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI practice sessions:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Error fetching AI practice sessions",
        };
    }
}