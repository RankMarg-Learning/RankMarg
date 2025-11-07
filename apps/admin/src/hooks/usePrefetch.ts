import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';

// Prefetch hook for better UX
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchSubjects = async (examCode?: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subjects.byExam(examCode),
      queryFn: async () => {
        const { data } = await api.get(`/subjects${examCode ? `?examCode=${examCode}` : ''}`);
        return data;
      },
      ...getQueryConfig('STATIC'),
    });
  };

  const prefetchTopics = async (subjectId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.topics.bySubject(subjectId),
      queryFn: async () => {
        const { data } = await api.get(`/topics?subjectId=${subjectId}`);
        return data;
      },
      ...getQueryConfig('STATIC'),
    });
  };

  const prefetchSubtopics = async (topicId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subtopics.byTopic(topicId),
      queryFn: async () => {
        const { data } = await api.get(`/subtopics?topicId=${topicId}`);
        return data;
      },
      ...getQueryConfig('STATIC'),
    });
  };

  const prefetchQuestion = async (slug: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.questions.bySlug(slug),
      queryFn: async () => {
        const { data } = await api.get(`/questions/${slug}`);
        return data;
      },
      ...getQueryConfig('DYNAMIC'),
    });
  };

  const prefetchTest = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tests.byId(id),
      queryFn: async () => {
        const { data } = await api.get(`/tests/${id}`);
        return data;
      },
      ...getQueryConfig('DYNAMIC'),
    });
  };

  const prefetchUserProfile = async (username: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(username),
      queryFn: async () => {
        const { data } = await api.get(`/profile/${username}`);
        return data;
      },
      ...getQueryConfig('USER_PREFERENCES'),
    });
  };

  const prefetchDashboard = async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.home(),
      queryFn: async () => {
        const { data } = await api.get('/v.1.0/home?subtopicsCount=3&sessionsCount=3');
        return data;
      },
      ...getQueryConfig('DYNAMIC'),
    });
  };

  const prefetchCurrentTopicStates = async (subjectId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.currentTopic.states(subjectId),
      queryFn: async () => {
        const { data } = await api.get(`/current-topic?subjectId=${subjectId}`);
        return data?.data || [];
      },
      ...getQueryConfig('SESSION'),
    });
  };

  // Batch prefetch for common navigation patterns
  const prefetchSubjectAndTopics = async (subjectId: string) => {
    await Promise.all([
      prefetchTopics(subjectId),
      prefetchCurrentTopicStates(subjectId),
    ]);
  };

  const prefetchTopicAndSubtopics = async (topicId: string) => {
    await prefetchSubtopics(topicId);
  };

  return {
    prefetchSubjects,
    prefetchTopics,
    prefetchSubtopics,
    prefetchQuestion,
    prefetchTest,
    prefetchUserProfile,
    prefetchDashboard,
    prefetchCurrentTopicStates,
    prefetchSubjectAndTopics,
    prefetchTopicAndSubtopics,
  };
};
