-- CreateIndex
CREATE INDEX "Attempt_userId_type_solvedAt_timing_idx" ON "Attempt"("userId", "type", "solvedAt", "timing");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_createdAt_isCompleted_idx" ON "PracticeSession"("userId", "createdAt", "isCompleted");
