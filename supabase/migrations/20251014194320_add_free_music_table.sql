-- Create free_music table to store user-uploaded music files
CREATE TABLE IF NOT EXISTS public.free_music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.free_music ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a game admin feature)
CREATE POLICY "Allow all access to free_music"
ON public.free_music
FOR ALL
USING (true)
WITH CHECK (true);
