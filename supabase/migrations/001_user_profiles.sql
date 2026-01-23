-- =====================================================
-- User Profiles Table for Style/Me App
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create user profiles table (extended user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Account info
    display_name TEXT,
    avatar_url TEXT,
    
    -- Style profile data
    style_preferences TEXT[] DEFAULT '{}',
    favourite_colors TEXT[] DEFAULT '{}',
    favourite_brands TEXT[] DEFAULT '{}',
    
    -- Calendar data
    calendar_events JSONB DEFAULT '[]',
    use_calendar_context BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their own profile
CREATE POLICY "Users can view own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
    ON user_profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage Bucket for Avatars
-- Note: Create this manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket called "avatars"
-- 3. Make it public (or configure signed URLs)
-- =====================================================

-- Storage policies for avatars bucket (run after creating bucket)
-- INSERT policy: Users can upload their own avatars
-- CREATE POLICY "Users can upload own avatar"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SELECT policy: Anyone can view avatars (public)
-- CREATE POLICY "Avatars are publicly accessible"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'avatars');

-- UPDATE policy: Users can update their own avatars
-- CREATE POLICY "Users can update own avatar"
--     ON storage.objects FOR UPDATE
--     USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE policy: Users can delete their own avatars
-- CREATE POLICY "Users can delete own avatar"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
