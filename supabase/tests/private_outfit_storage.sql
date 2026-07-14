-- Run against a dedicated test project after migrations 010 and 011.
-- These assertions are read-only and intentionally avoid production data.

DO $$
BEGIN
    IF (SELECT public FROM storage.buckets WHERE id = 'outfit-images') IS DISTINCT FROM FALSE THEN
        RAISE EXCEPTION 'outfit-images bucket must be private';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Users can view own outfit photos'
    ) THEN
        RAISE EXCEPTION 'owner SELECT policy is missing';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Outfit photos are publicly accessible'
    ) THEN
        RAISE EXCEPTION 'public outfit SELECT policy still exists';
    END IF;
END;
$$;

