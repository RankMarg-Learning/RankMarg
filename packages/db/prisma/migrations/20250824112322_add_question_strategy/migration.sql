-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "strategy" TEXT;

-- CreateIndex
CREATE INDEX "Attempt_userId_type_solvedAt_idx" ON "Attempt"("userId", "type", "solvedAt");

-- CreateIndex
CREATE INDEX "CurrentStudyTopic_userId_isCompleted_startedAt_idx" ON "CurrentStudyTopic"("userId", "isCompleted", "startedAt");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_createdAt_idx" ON "PracticeSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PracticeSessionQuestions_practiceSessionId_idx" ON "PracticeSessionQuestions"("practiceSessionId");
