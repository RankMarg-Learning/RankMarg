// Query key factory for better organization and type safety
export const queryKeys = {
  // User related queries
  user: {
    all: ['user'] as const,
    profile: (username?: string) => ['user', 'profile', username] as const,
    current: () => ['user', 'current'] as const,
  },

  // Subject related queries
  subjects: {
    all: ['subjects'] as const,
    byExam: (examCode?: string) => ['subjects', examCode] as const,
  },

  // Topic related queries
  topics: {
    all: ['topics'] as const,
    bySubject: (subjectId?: string) => ['topics', subjectId] as const,
  },

  // Subtopic related queries
  subtopics: {
    all: ['subtopics'] as const,
    byTopic: (topicId?: string) => ['subtopics', topicId] as const,
  },

  // Question related queries
  questions: {
    all: ['questions'] as const,
    bySlug: (slug: string) => ['questions', slug] as const,
    byId: (id: string) => ['questions', id] as const,
    byFilters: (filters: {
      page?: number;
      subject?: string;
      difficulty?: string;
      pyqYear?: string;
      search?: string;
      isPublished?: boolean;
      examCode?: string;
    }) => ['questions', 'filters', filters] as const,
  },

  // Test related queries
  tests: {
    all: ['tests'] as const,
    available: (limit?: number, type?: string) => ['tests', 'available', limit, type] as const,
    recommended: () => ['tests', 'recommended'] as const,
    results: (limit?: number) => ['tests', 'results', limit] as const,
    scheduled: () => ['tests', 'schedule'] as const,
    byId: (id: string) => ['tests', id] as const,
    analysis: (testId: string) => ['testAnalysis', testId] as const,
  },

  // Session related queries
  sessions: {
    all: ['sessions'] as const,
    practice: (params?: any) => ['sessions', 'practice', params] as const,
    byType: (type: string, count?: number) => ['sessions', type, count] as const,
    aiPractice: (sessionId: string) => ['session', sessionId] as const,
  },

  // Dashboard related queries
  dashboard: {
    all: ['dashboard'] as const,
    home: () => ['homeCombined'] as const,
    test: (params?: any) => ['testDashboard', params] as const,
    aiPractice: () => ['aiPractice'] as const,
    mistakes: () => ['mistakesDashboard'] as const,
  },

  // Current topic related queries
  currentTopic: {
    all: ['current-topic'] as const,
    states: (subjectId?: string) => ['current-topic-states', subjectId] as const,
    global: () => ['current-topic-global'] as const,
  },

  // Mastery related queries
  mastery: {
    all: ['mastery'] as const,
    bySubject: (subjectId: string, sortBy?: string) => ['subjectMastery', subjectId, sortBy] as const,
    byTopic: (topicId: string) => ['mastery', 'topic', topicId] as const,
  },

  // Performance related queries
  performance: {
    all: ['performance'] as const,
    bySubject: (subjectId: string) => ['performance', 'subject', subjectId] as const,
    byTopic: (topicId: string) => ['performance', 'topic', topicId] as const,
  },

  // Suggestions related queries
  suggestions: {
    all: ['suggestions'] as const,
    active: (params?: any) => ['suggestions', 'active', params] as const,
  },

  // Activity related queries
  activities: {
    all: ['activities'] as const,
    byUser: (userId: string, limit?: number) => ['activities', userId, limit] as const,
    rankPoints: () => ['activity'] as const,
  },

  // Current studies related queries
  currentStudies: {
    all: ['currentStudies'] as const,
    byUser: (userId: string) => ['currentStudies', userId] as const,
  },

  // Blog related queries
  blogs: {
    all: ['blogs'] as const,
    bySlug: (slug: string) => ['blogs', slug] as const,
  },

  // Challenge related queries
  challenges: {
    all: ['challenges'] as const,
    info: () => ['challenge-info'] as const,
    byId: (challengeId: string) => ['challenge-info', challengeId] as const,
  },

  // Leaderboard related queries
  leaderboard: {
    byTest: (testId: string) => ['leaderboard', testId] as const,
  },

  // Profile related queries
  profile: {
    all: ['profile'] as const,
  },

  // AI Practice related queries
  aiPractice: {
    results: () => ['results'] as const,
  },
} as const;

// Type for query keys
export type QueryKeys = typeof queryKeys;
