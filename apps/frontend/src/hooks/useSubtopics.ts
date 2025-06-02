import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubtopics,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from '../services/subtopic.service';

export const useSubtopics = (topicId: string) => {
  const queryClient = useQueryClient();

  const { data: subtopics = [], isLoading } = useQuery({
    queryKey: ['subtopics', topicId],
    queryFn: () => getSubtopics(topicId),
  });

  const saveSubTopic = useMutation({
    mutationFn: async (data: { id?: string; name: string; topicId: string }) => {
      if (data.id) {
        return updateSubtopic(data.id, data.name, data.topicId);
      } else {
        return addSubtopic(data.name, data.topicId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', topicId] });
    },
  });

  const removeSubTopic = useMutation({
    mutationFn: deleteSubtopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', topicId] });
    },
  });

  return { subtopics, isLoading, saveSubTopic, removeSubTopic };
};
