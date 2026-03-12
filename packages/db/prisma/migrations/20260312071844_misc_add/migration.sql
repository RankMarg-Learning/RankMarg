-- CreateTable
CREATE TABLE "Misc" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT,
    "userId" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Misc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Misc_key_key" ON "Misc"("key");

-- CreateIndex
CREATE INDEX "Misc_key_idx" ON "Misc"("key");

-- CreateIndex
CREATE INDEX "Misc_type_idx" ON "Misc"("type");

-- CreateIndex
CREATE INDEX "Misc_userId_idx" ON "Misc"("userId");

-- AddForeignKey
ALTER TABLE "Misc" ADD CONSTRAINT "Misc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
