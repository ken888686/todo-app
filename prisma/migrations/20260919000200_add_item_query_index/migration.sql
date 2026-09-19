ALTER TABLE "items"
ALTER COLUMN "expiredAt" SET DEFAULT NOW() + interval '1 day';

CREATE INDEX "items_userId_status_title_createdAt_idx"
ON "items"("userId", "status", "title", "createdAt");
