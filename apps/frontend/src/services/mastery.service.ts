import api from "@/utils/api";


export const getSubjectMastery = async (subjectId: string) => {
    try {
        const response = await api.get(`/v.1.0/mastery/${subjectId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return {
            success: false,
            message: "Error fetching subjects",
        };
    }
};
