-- Create audio_settings table to store uploaded audio files
CREATE TABLE IF NOT EXISTS public.audio_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_type TEXT NOT NULL UNIQUE,
  audio_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audio_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a game admin feature)
CREATE POLICY "Allow all access to audio_settings"
ON public.audio_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default audio types
INSERT INTO public.audio_settings (audio_type, audio_url, file_name) VALUES
  ('regular_answer', '/audio/regularAnswer.mp3', 'regularAnswer.mp3'),
  ('highest_answer', '/audio/highestAnswer.mp3', 'highestAnswer.mp3'),
  ('wrong_answer', '/audio/jawabanSalah.mp3', 'jawabanSalah.mp3'),
  ('add_strike', NULL, NULL),
  ('round_points', NULL, NULL),
  ('background_music', NULL, NULL)
ON CONFLICT (audio_type) DO NOTHING;

-- Create storage bucket for audio files (without public column)
INSERT INTO storage.buckets (id, name) 
VALUES ('game-audio', 'game-audio')
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio uploads
CREATE POLICY "Allow public read access to game audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-audio');

CREATE POLICY "Allow public upload to game audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-audio');

CREATE POLICY "Allow public update to game audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'game-audio');

CREATE POLICY "Allow public delete from game audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'game-audio');