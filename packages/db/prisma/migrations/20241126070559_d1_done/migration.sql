/*
  Warnings:

  - Added the required column `title` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Stream" AS ENUM ('JEE', 'NEET');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "stream" "Stream",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Locaction" TEXT,
ADD COLUMN     "stream" "Stream",
ALTER COLUMN "rank" SET DEFAULT 100;
