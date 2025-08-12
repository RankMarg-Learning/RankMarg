import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTopics,
  addTopic,
  updateTopic,
  deleteTopic,
} from '../services/topic.service';

export const useTopics = (subjectId?: string) => {
  const queryClient = useQueryClient();
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics',subjectId],
    queryFn: () => getTopics(subjectId),
  });

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
      queryClient.invalidateQueries({ queryKey: ['topics', subjectId] });
    },
  });

  const removeTopic = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', subjectId] });
    },
  });

  return { topics, isLoading, saveTopic, removeTopic };
};
