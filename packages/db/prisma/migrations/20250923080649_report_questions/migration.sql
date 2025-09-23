-- CreateTable
CREATE TABLE "ReportQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT,
    "type" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportQuestion_userId_idx" ON "ReportQuestion"("userId");

-- CreateIndex
CREATE INDEX "ReportQuestion_slug_idx" ON "ReportQuestion"("slug");
