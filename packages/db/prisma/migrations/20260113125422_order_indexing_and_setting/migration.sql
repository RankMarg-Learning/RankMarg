-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "label" TEXT;

-- AlterTable
ALTER TABLE "SubTopic" ADD COLUMN     "weightage" DOUBLE PRECISION DEFAULT 0.0;

-- AlterTable
ALTER TABLE "TestQuestion" ADD COLUMN     "orderIndex" INTEGER;

-- AlterTable
ALTER TABLE "TestSection" ADD COLUMN     "orderIndex" INTEGER;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settings" JSONB,
    "goal_value" DOUBLE PRECISION,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
