/*
  Warnings:

  - You are about to drop the column `user1Id` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `user1Score` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `user2Score` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `Challenge` table. All the data in the column will be lost.
  - The `status` column on the `Challenge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `player1Id` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_user2Id_fkey";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "user1Id",
DROP COLUMN "user1Score",
DROP COLUMN "user2Id",
DROP COLUMN "user2Score",
DROP COLUMN "winner",
ADD COLUMN     "player1Id" TEXT NOT NULL,
ADD COLUMN     "player1Score" INTEGER DEFAULT 0,
ADD COLUMN     "player2Id" TEXT,
ADD COLUMN     "player2Score" INTEGER DEFAULT 0,
ADD COLUMN     "result" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "CStatus";

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
