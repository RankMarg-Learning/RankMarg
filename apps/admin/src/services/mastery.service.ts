import api from "@/utils/api";


export const getSubjectMastery = async (subjectId: string, sortBy?: string) => {
    try {
        const params = new URLSearchParams();
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        
        const url = `/mastery/subjects/${subjectId}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return {
            success: false,
            message: "Error fetching subjects",
        };
    }
};
