"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@repo/common-utils/lib/queryKeys";
import { getQueryConfig } from "@repo/common-utils/lib/queryConfig";

type SubtopicInput = {
  id?: string;
  name: string;
  topicId: string;
  slug?: string;
  orderIndex?: number;
  estimatedMinutes?: number;
  weightage?: number;
};

type UseSubtopicsDeps<Response> = {
  getSubtopics: (topicId?: string) => Promise<Response>;
  addSubtopic: (name: string, topicId: string, slug?: string, orderIndex?: number, estimatedMinutes?: number, weightage?: number) => Promise<unknown>;
  updateSubtopic: (
    id: string,
    name: string,
    topicId: string,
    slug?: string,
    orderIndex?: number,
    estimatedMinutes?: number,
    weightage?: number
  ) => Promise<unknown>;
  deleteSubtopic: (id: string) => Promise<unknown>;
  useQueryError: () => {
    handleMutationError: (error: any, context?: string) => void;
  };
  selectSubtopics?: (response: Response) => any[];
};

export function createUseSubtopics<Response extends { data?: any[] }>({
  getSubtopics,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
  useQueryError,
  selectSubtopics,
}: UseSubtopicsDeps<Response>) {
  return function useSubtopics(topicId?: string) {
    const queryClient = useQueryClient();
    const { handleMutationError } = useQueryError();

    const queryResult = useQuery({
      queryKey: topicId ? queryKeys.subtopics.byTopic(topicId) : queryKeys.subtopics.all,
      queryFn: () => getSubtopics(topicId),
      enabled: true,
      ...getQueryConfig("STATIC"),
    });

    const subtopics = selectSubtopics ? selectSubtopics(queryResult.data as Response) : (queryResult.data as Response)?.data || [];

    const saveSubTopic = useMutation({
      mutationFn: async (data: SubtopicInput) => {
        if (data.id) {
          return updateSubtopic(data.id, data.name, data.topicId, data.slug, data.orderIndex, data.estimatedMinutes, data.weightage);
        }
        return addSubtopic(data.name, data.topicId, data.slug, data.orderIndex, data.estimatedMinutes, data.weightage);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.subtopics.all });
      },
      onError: (error) => handleMutationError(error, "saveSubTopic"),
    });

    const removeSubTopic = useMutation({
      mutationFn: deleteSubtopic,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.subtopics.all });
      },
      onError: (error) => handleMutationError(error, "removeSubTopic"),
    });

    return { subtopics, isLoading: queryResult.isLoading, error: queryResult.error, saveSubTopic, removeSubTopic };
  };
}
