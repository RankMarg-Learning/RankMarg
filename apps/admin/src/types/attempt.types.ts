import { AttemptType, SubmitStatus } from "@repo/db/enums";

export interface AttemptRequestBody {
    questionId: string;
    isCorrect: boolean;
    answer: string;
    timing: number;
    reactionTime?: number;
    isHintUsed: boolean;
    id: string; 
}

export interface AttemptCreateData {
    userId: string;
    questionId: string;
    type: AttemptType;
    answer: string;
    reactionTime?: number;
    status: SubmitStatus;
    hintsUsed: boolean;
    timing: number;
    practiceSessionId?: string;
    testParticipationId?: string;
}