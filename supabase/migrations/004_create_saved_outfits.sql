-- =====================================================
-- Saved Outfits Table and Storage
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create saved_outfits table
CREATE TABLE IF NOT EXISTS saved_outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    rating_text TEXT,
    numeric_rating NUMERIC,
    advisor_mode TEXT,
    social_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies for saved_outfits
DROP POLICY IF EXISTS "Users can view own outfits" ON saved_outfits;
CREATE POLICY "Users can view own outfits" 
    ON saved_outfits FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own outfits" ON saved_outfits;
CREATE POLICY "Users can insert own outfits" 
    ON saved_outfits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own outfits" ON saved_outfits;
CREATE POLICY "Users can delete own outfits" 
    ON saved_outfits FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Create Index
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);


-- =====================================================
-- Storage Policies for 'outfit-photos' Bucket
-- IMPORTANT: You must manually create a public bucket named 'outfit-photos' first!
-- =====================================================

-- Allow users to upload their own photos
DROP POLICY IF EXISTS "Users can upload own outfit photos" ON storage.objects;
CREATE POLICY "Users can upload own outfit photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'outfit-images'  
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to all outfit photos (so they can be shared/displayed)
DROP POLICY IF EXISTS "Outfit photos are publicly accessible" ON storage.objects;
CREATE POLICY "Outfit photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'outfit-images');

-- Allow users to delete their own photos
DROP POLICY IF EXISTS "Users can delete own outfit photos" ON storage.objects;
CREATE POLICY "Users can delete own outfit photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'outfit-images'  
    AND auth.uid()::text = (storage.foldername(name))[1]
);
