import api from "@/utils/api";

export interface TestParticipant {
  id: string;
  userId: string;
  testId: string;
  score: number | null;
  status: string;
  accuracy: number | null;
  timing: number | null;
  maxStreakCorrect: number | null;
  maxStreakWrong: number | null;
  cntMinmize: number | null;
  cntAnsweredMark: number | null;
  cntAnswered: number | null;
  cntNotAnswered: number | null;
  cntMarkForReview: number | null;
  startTime: Date;
  endTime: Date;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    avatar: string | null;
    phone: string | null;
  };
  stats: {
    totalAttempts: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
  };
}

export interface TestParticipantsResponse {
  participants: TestParticipant[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetTestParticipantsParams {
  testId: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'accuracy' | 'startTime';
  sortOrder?: 'asc' | 'desc';
}

export const getTestParticipants = async (
  params: GetTestParticipantsParams
): Promise<{ success: boolean; data?: TestParticipantsResponse; message?: string }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(
      `/test/${params.testId}/participants?${queryParams.toString()}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching test participants:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching test participants",
    };
  }
};

export const deleteTestParticipant = async (
  testId: string,
  participantId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(
      `/test/${testId}/participants/${participantId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting test participant:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error deleting test participant",
    };
  }
};
