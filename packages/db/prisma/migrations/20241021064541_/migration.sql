/*
  Warnings:

  - The primary key for the `Challenge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Challenge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChallengeToQuestion" DROP CONSTRAINT "_ChallengeToQuestion_A_fkey";

-- AlterTable
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Challenge_pkey" PRIMARY KEY ("challengeId");

-- AddForeignKey
ALTER TABLE "_ChallengeToQuestion" ADD CONSTRAINT "_ChallengeToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("challengeId") ON DELETE CASCADE ON UPDATE CASCADE;
