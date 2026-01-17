-- AlterTable
ALTER TABLE "StudySuggestion" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sequenceOrder" INTEGER;

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_status_expiresAt_idx" ON "StudySuggestion"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_sequenceOrder_createdAt_idx" ON "StudySuggestion"("userId", "sequenceOrder", "createdAt");
