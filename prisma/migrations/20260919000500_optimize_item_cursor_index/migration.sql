DROP INDEX IF EXISTS "items_userId_status_title_createdAt_idx";

CREATE INDEX "items_userId_status_title_createdAt_id_idx"
ON "items"("userId", "status", "title", "createdAt", "id");
