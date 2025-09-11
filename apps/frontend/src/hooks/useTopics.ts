import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTopics,
  addTopic,
  updateTopic,
  deleteTopic,
} from '../services/topic.service';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import { useQueryError } from './useQueryError';

export const useTopics = (subjectId?: string) => {
  const queryClient = useQueryClient();
  const { handleMutationError } = useQueryError();

  const { data: response, isLoading, error } = useQuery({
    queryKey: queryKeys.topics.bySubject(subjectId),
    queryFn: () => getTopics(subjectId),
    enabled: true,
    ...getQueryConfig('STATIC'),
  });
  const topics = response?.data || [];

  const saveTopic = useMutation({
    mutationFn: async (data: { 
      id?: string; 
      name: string; 
      subjectId: string; 
      weightage: number;
      slug?: string;
      orderIndex?: number;
      estimatedMinutes?: number;
    }) => {
      if (data.id) {
        return updateTopic(data.id, data.name, data.subjectId, data.weightage, data.slug, data.orderIndex, data.estimatedMinutes);
      } else {
        return addTopic(data.name, data.subjectId, data.weightage, data.slug, data.orderIndex, data.estimatedMinutes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.bySubject(subjectId) });
    },
    onError: (error) => handleMutationError(error, 'saveTopic'),
  });

  const removeTopic = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.bySubject(subjectId) });
    },
    onError: (error) => handleMutationError(error, 'removeTopic'),
  });

  return { topics, isLoading, error, saveTopic, removeTopic };
};
