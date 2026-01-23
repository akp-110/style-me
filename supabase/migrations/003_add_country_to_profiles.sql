-- =====================================================
-- Add country_code to user_profiles
-- Run this in your Supabase SQL Editor
-- =====================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';
