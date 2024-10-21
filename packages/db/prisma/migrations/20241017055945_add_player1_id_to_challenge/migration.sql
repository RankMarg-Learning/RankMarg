/*
  Warnings:

  - Made the column `player1Id` on table `Challenge` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Challenge" ALTER COLUMN "player1Id" SET NOT NULL;
