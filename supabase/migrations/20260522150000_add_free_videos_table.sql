-- Create free_videos table to store user-uploaded video files
CREATE TABLE IF NOT EXISTS public.free_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.free_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a game admin feature)
CREATE POLICY "Allow all access to free_videos"
ON public.free_videos
FOR ALL
USING (true)
WITH CHECK (true);
