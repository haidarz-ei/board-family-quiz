-- =============================================================
-- Explicit GRANT for all public tables
-- Required due to Supabase policy change (Oct 30, 2026):
-- New tables in "public" schema no longer auto-exposed to Data API.
-- This migration ensures all existing tables remain accessible
-- via supabase-js / PostgREST.
-- =============================================================

-- Rooms & game state
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_devices TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_state TO anon, authenticated;

-- Audio & media
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.free_music TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.free_videos TO anon, authenticated;

-- Users & subscriptions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO anon, authenticated;
