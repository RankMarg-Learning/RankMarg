-- DropForeignKey
ALTER TABLE "TestParticipation" DROP CONSTRAINT "TestParticipation_testId_fkey";

-- DropForeignKey
ALTER TABLE "TestParticipation" DROP CONSTRAINT "TestParticipation_userId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdBy" TEXT;

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "message" TEXT,
    "earnCoin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
