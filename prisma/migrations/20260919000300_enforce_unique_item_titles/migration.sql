ALTER TABLE "items"
ADD COLUMN "normalizedTitle" TEXT;

UPDATE "items"
SET "normalizedTitle" = lower(btrim("title"));

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "items"
        GROUP BY "userId", "normalizedTitle"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot enforce unique item titles: duplicate titles exist for at least one user';
    END IF;
END $$;

ALTER TABLE "items"
ALTER COLUMN "normalizedTitle" SET NOT NULL;

CREATE UNIQUE INDEX "items_userId_normalizedTitle_key"
ON "items"("userId", "normalizedTitle");
