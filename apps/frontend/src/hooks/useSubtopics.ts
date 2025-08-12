import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubtopics,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from '../services/subtopic.service';

export const useSubtopics = (topicId?: string) => {
  const queryClient = useQueryClient();

  const { data: subtopics = [], isLoading } = useQuery({
    queryKey: topicId ? ['subtopics', topicId] : ['subtopics', 'all'],
    queryFn: () => getSubtopics(topicId),
    enabled: true, // Always enable the query
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
      queryClient.invalidateQueries({ queryKey: ['subtopics'] });
    },
  });

  const removeSubTopic = useMutation({
    mutationFn: deleteSubtopic,
    onSuccess: () => {
      // Invalidate both specific and all subtopics queries
      queryClient.invalidateQueries({ queryKey: ['subtopics'] });
    },
  });

  return { subtopics, isLoading, saveSubTopic, removeSubTopic };
};
