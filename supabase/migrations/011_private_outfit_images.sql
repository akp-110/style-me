-- Human-gated private storage cutover. Apply only after migration 010, the
-- signed-URL client deployment, and an approved complete backfill.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.saved_outfits WHERE image_path IS NULL) THEN
        RAISE EXCEPTION 'private cutover blocked: saved_outfits rows still lack image_path';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'outfit-images') THEN
        RAISE EXCEPTION 'private cutover blocked: outfit-images bucket does not exist';
    END IF;
END;
$$;

UPDATE storage.buckets
SET public = FALSE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg']::TEXT[]
WHERE id = 'outfit-images';

DROP POLICY IF EXISTS "Outfit photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own outfit photos" ON storage.objects;
CREATE POLICY "Users can view own outfit photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'outfit-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload own outfit photos" ON storage.objects;
CREATE POLICY "Users can upload own outfit photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'outfit-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
    AND storage.extension(name) = 'jpg'
);

DROP POLICY IF EXISTS "Users can delete own outfit photos" ON storage.objects;
CREATE POLICY "Users can delete own outfit photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'outfit-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

ALTER TABLE public.saved_outfits
    ALTER COLUMN image_path SET NOT NULL;

