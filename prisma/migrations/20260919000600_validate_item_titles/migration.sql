ALTER TABLE "items"
ADD CONSTRAINT "items_title_valid_check"
CHECK (btrim("title") <> '' AND char_length("title") <= 200);

ALTER TABLE "items"
ADD CONSTRAINT "items_normalized_title_valid_check"
CHECK (btrim("normalizedTitle") <> '' AND char_length("normalizedTitle") <= 200);
