
// User basic profile type
export type UserBasicProfile = {
  name: string;
  username: string;
  avatar: string | null;
  coins: number;
  createdAt: Date;
  isSelf: boolean;
};

// Additional user statistics
export type UserAdditionalInfo = {
  totalAttempt: number;
  totalQuestions: number;
  totalTest: number;
  totalChallenge?: number;
  accuracy: number;
};

// Challenge details for a single challenge
export type UserChallengeDetails = {
  challengeId: string;
  userScore: number | null;
  createdAt: Date;
  attemptScore: number[] | null;
};

// Challenge statistics, including recent challenges
export type UserChallengeStats = {
  rank: number | null;
  recentChallenges: UserChallengeDetails[];
};

// Statistics for individual subjects
export type SubjectStats = {
  AttemptCount: number;
  TotalQuestion: number;
};

// Map of subject statistics, where the key is the subject name
export type SubjectStatsMap = Record<string, SubjectStats>;

interface RecentTestProps {
  testId: string,
  score: number,
  test: {
    title: string,
    totalMarks: number,
  }
}
// Complete API response type for user profile
export type UserProfileResponse = {
  basicProfile: UserBasicProfile;
  additionalInfo: UserAdditionalInfo;
  subjects?: SubjectStatsMap;
  // challengeStats: UserChallengeStats;
  solvedAtValues: Date[];
  // attempts: AttemptProps[];
  recentTest: RecentTestProps[];
};
