-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for game audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload game audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update game audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete game audio" ON storage.objects;

-- Create game-audio bucket if not exists
INSERT INTO storage.buckets (id, name)
VALUES ('game-audio', 'game-audio')
ON CONFLICT (id) DO NOTHING;

-- Public read access for game-audio files
CREATE POLICY "Public read access for game audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-audio');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload game audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-audio' 
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update game audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-audio' 
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete game audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-audio' 
  AND auth.uid() IS NOT NULL
);