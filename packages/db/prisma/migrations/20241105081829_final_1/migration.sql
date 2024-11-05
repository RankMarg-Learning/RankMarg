/*
  Warnings:

  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_ChallengeToQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChallengeToQuestion" DROP CONSTRAINT "_ChallengeToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengeToQuestion" DROP CONSTRAINT "_ChallengeToQuestion_B_fkey";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "attemptByPlayer1" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "attemptByPlayer2" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "hint" TEXT,
ADD COLUMN     "questionTime" INTEGER DEFAULT 5;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "standard" TEXT;

-- DropTable
DROP TABLE "_ChallengeToQuestion";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "ChallengeQuestion" (
    "challengeId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "ChallengeQuestion_pkey" PRIMARY KEY ("challengeId","questionId")
);

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("challengeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
