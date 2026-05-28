CREATE TABLE IF NOT EXISTS public.free_music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.free_music ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to free_music" ON public.free_music;
CREATE POLICY "Allow all access to free_music" ON public.free_music FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('game-audio', 'game-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read game-audio" ON storage.objects;
CREATE POLICY "Public read game-audio" ON storage.objects FOR SELECT USING (bucket_id = 'game-audio');
DROP POLICY IF EXISTS "Public write game-audio" ON storage.objects;
CREATE POLICY "Public write game-audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-audio');
DROP POLICY IF EXISTS "Public update game-audio" ON storage.objects;
CREATE POLICY "Public update game-audio" ON storage.objects FOR UPDATE USING (bucket_id = 'game-audio');
DROP POLICY IF EXISTS "Public delete game-audio" ON storage.objects;
CREATE POLICY "Public delete game-audio" ON storage.objects FOR DELETE USING (bucket_id = 'game-audio');

INSERT INTO public.audio_settings (audio_type)
SELECT t FROM (VALUES ('regular_answer'),('highest_answer'),('wrong_answer'),('add_strike'),('round_points'),('background_music')) AS v(t)
WHERE NOT EXISTS (SELECT 1 FROM public.audio_settings WHERE audio_type = v.t);