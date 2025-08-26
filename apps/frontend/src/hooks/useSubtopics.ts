import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubtopics,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from '../services/subtopic.service';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import { useQueryError } from './useQueryError';

export const useSubtopics = (topicId?: string) => {
  const queryClient = useQueryClient();
  const { handleMutationError } = useQueryError();

  const { data: subtopics = [], isLoading, error } = useQuery({
    queryKey: topicId ? queryKeys.subtopics.byTopic(topicId) : queryKeys.subtopics.all,
    queryFn: () => getSubtopics(topicId),
    enabled: true, 
    ...getQueryConfig('STATIC'),
  });

  const saveSubTopic = useMutation({
    mutationFn: async (data: { 
      id?: string; 
      name: string; 
      topicId: string;
      slug?: string;
      orderIndex?: number;
      estimatedMinutes?: number;
    }) => {
      if (data.id) {
        return updateSubtopic(data.id, data.name, data.topicId, data.slug, data.orderIndex, data.estimatedMinutes);
      } else {
        return addSubtopic(data.name, data.topicId, data.slug, data.orderIndex, data.estimatedMinutes);
      }
    },
    onSuccess: () => {
      // Invalidate both specific and all subtopics queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtopics.all });
    },
    onError: (error) => handleMutationError(error, 'saveSubTopic'),
  });

  const removeSubTopic = useMutation({
    mutationFn: deleteSubtopic,
    onSuccess: () => {
      // Invalidate both specific and all subtopics queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtopics.all });
    },
    onError: (error) => handleMutationError(error, 'removeSubTopic'),
  });

  return { subtopics, isLoading, error, saveSubTopic, removeSubTopic };
};
