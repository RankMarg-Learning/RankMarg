/*
  Warnings:

  - You are about to drop the column `completed` on the `TestParticipation` table. All the data in the column will be lost.
  - The primary key for the `TestQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `testId` on the `TestQuestion` table. All the data in the column will be lost.
  - The `isCorrect` column on the `TestSubmission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `testSectionId` to the `TestQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `TestSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('JOIN', 'STARTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "isCorrectEnum" AS ENUM ('TRUE', 'FALSE', 'NOT_ANSWERED');

-- DropForeignKey
ALTER TABLE "TestParticipation" DROP CONSTRAINT "TestParticipation_testId_fkey";

-- DropForeignKey
ALTER TABLE "TestParticipation" DROP CONSTRAINT "TestParticipation_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestQuestion" DROP CONSTRAINT "TestQuestion_testId_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmission" DROP CONSTRAINT "TestSubmission_participationId_fkey_2";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isPublished" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "description" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "examType" TEXT,
ADD COLUMN     "isPublished" BOOLEAN DEFAULT false,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "stream" TEXT,
ADD COLUMN     "testKey" TEXT,
ADD COLUMN     "totalMarks" INTEGER,
ADD COLUMN     "totalQuestions" INTEGER;

-- AlterTable
ALTER TABLE "TestParticipation" DROP COLUMN "completed",
ADD COLUMN     "accuracy" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'JOIN',
ADD COLUMN     "timing" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "TestQuestion" DROP CONSTRAINT "TestQuestion_pkey",
DROP COLUMN "testId",
ADD COLUMN     "testSectionId" TEXT NOT NULL,
ADD CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("testSectionId", "questionId");

-- AlterTable
ALTER TABLE "TestSubmission" ADD COLUMN     "testId" TEXT NOT NULL,
ADD COLUMN     "timing" INTEGER DEFAULT 0,
DROP COLUMN "isCorrect",
ADD COLUMN     "isCorrect" "isCorrectEnum" NOT NULL DEFAULT 'NOT_ANSWERED';

-- CreateTable
CREATE TABLE "TestSection" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "maxQuestions" INTEGER,
    "correctMarks" DOUBLE PRECISION,
    "negativeMarks" DOUBLE PRECISION,

    CONSTRAINT "TestSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestSection" ADD CONSTRAINT "TestSection_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testSectionId_fkey" FOREIGN KEY ("testSectionId") REFERENCES "TestSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;
