import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

interface QuestionCountsResponse {
    success: boolean;
    data: {
        counts: Record<string, number>;
    };
    message: string;
}

interface UseQuestionCountsOptions {
    entityType: "subject" | "topic" | "subtopic";
    parentId?: string;
    enabled?: boolean;
}


export const useQuestionCounts = ({
    entityType,
    parentId,
    enabled = true,
}: UseQuestionCountsOptions) => {
    return useQuery({
        queryKey: ["question-counts", entityType, parentId],
        queryFn: async () => {
            const params: Record<string, string> = { entityType };
            if (parentId) {
                params.parentId = parentId;
            }

            const response = await api.get<QuestionCountsResponse>(
                "/question/counts",
                { params }
            );

            return response.data.data.counts;
        },
        enabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};


export const getCountForEntity = (
    counts: Record<string, number> | undefined,
    entityId: string
): number => {
    return counts?.[entityId] ?? 0;
};
