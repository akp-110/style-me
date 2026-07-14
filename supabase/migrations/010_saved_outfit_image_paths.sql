-- Compatibility-first schema for private saved-outfit objects.
-- This migration does not change bucket visibility or subscription tiers.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'saved_outfits'
          AND column_name IN ('photo_url', 'image_url')
    ) THEN
        RAISE EXCEPTION 'saved_outfits has neither photo_url nor image_url; inspect the deployed schema before continuing';
    END IF;
END;
$$;

ALTER TABLE public.saved_outfits
    ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Legacy migrations made photo_url required, while some deployed schemas use
-- image_url instead. Keep either column for rollback, but allow the new client
-- to write only image_path during the compatibility release.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'saved_outfits'
          AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE public.saved_outfits ALTER COLUMN photo_url DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'saved_outfits'
          AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.saved_outfits ALTER COLUMN image_url DROP NOT NULL;
    END IF;
END;
$$;

ALTER TABLE public.saved_outfits
    DROP CONSTRAINT IF EXISTS saved_outfits_image_path_format;

ALTER TABLE public.saved_outfits
    ADD CONSTRAINT saved_outfits_image_path_format CHECK (
        image_path IS NULL OR (
            split_part(image_path, '/', 1) = user_id::TEXT
            AND image_path ~ '^[0-9a-fA-F-]{36}/([0-9a-fA-F-]{36}|[0-9]{10,16})\.jpg$'
        )
    );

COMMENT ON COLUMN public.saved_outfits.image_path IS
    'Private outfit-images bucket object path; signed/public URLs must not be stored here.';
