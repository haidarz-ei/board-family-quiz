-- 1. Hapus semua data yang ada (mulai dari nol)
DELETE FROM public.free_music;
DELETE FROM public.free_videos;

-- 2. Tambahkan kolom room_code yang wajib diisi (NOT NULL)
ALTER TABLE public.free_music ADD COLUMN room_code text NOT NULL;
ALTER TABLE public.free_videos ADD COLUMN room_code text NOT NULL;

-- 3. Perbarui Cron Job agar ikut menghapus media yang sudah berumur lebih dari 24 jam
-- Unschedule cron job lama jika ada
SELECT cron.unschedule('auto-delete-old-rooms');

-- Schedule cron job baru yang menghapus room, music, dan video
SELECT cron.schedule(
  'auto-delete-old-rooms',
  '0 * * * *',
  $$ 
    DELETE FROM public.free_music WHERE created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM public.free_videos WHERE created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM public.rooms WHERE created_at < NOW() - INTERVAL '24 hours'; 
  $$
);
