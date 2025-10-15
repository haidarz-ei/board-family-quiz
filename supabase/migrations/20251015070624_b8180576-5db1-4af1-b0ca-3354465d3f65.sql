-- Fix storage bucket configuration for game-audio
-- Ensure the bucket exists with correct structure
INSERT INTO storage.buckets (id, name)
VALUES ('game-audio', 'game-audio')
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;

-- Create RLS policies for game-audio bucket
CREATE POLICY "Anyone can view audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-audio');

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-audio');

CREATE POLICY "Authenticated users can update audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'game-audio');

CREATE POLICY "Authenticated users can delete audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'game-audio');