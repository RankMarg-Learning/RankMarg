/*
  Warnings:

  - You are about to drop the column `action` on the `StudySuggestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,metricType]` on the table `Metric` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `StudySuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `StudySuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerType` to the `StudySuggestion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `StudySuggestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('ENCOURAGEMENT', 'WARNING', 'CELEBRATION', 'GUIDANCE', 'REMINDER', 'MOTIVATION', 'WELLNESS');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('POST_EXAM', 'SESSION_ANALYSIS', 'DAILY_ANALYSIS', 'WEEKLY_ANALYSIS', 'MONTHLY_ANALYSIS', 'STREAK_MILESTONE', 'INACTIVITY', 'EXAM_PROXIMITY');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('ACTIVE', 'VIEWED', 'DISMISSED');

-- DropIndex
DROP INDEX "StudySuggestion_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "StudySuggestion" DROP COLUMN "action",
ADD COLUMN     "actionName" TEXT,
ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "displayUntil" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL,
ADD COLUMN     "status" "SuggestionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "triggerType" "TriggerType" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "SuggestionType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Metric_userId_metricType_key" ON "Metric"("userId", "metricType");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_status_createdAt_idx" ON "StudySuggestion"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_triggerType_idx" ON "StudySuggestion"("userId", "triggerType");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


