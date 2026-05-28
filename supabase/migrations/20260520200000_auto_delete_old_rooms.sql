-- Setup pg_cron job to delete rooms older than 24 hours
-- This will run every hour (at minute 0)
SELECT cron.schedule(
  'auto-delete-old-rooms',
  '0 * * * *',
  $$ DELETE FROM public.rooms WHERE created_at < NOW() - INTERVAL '24 hours'; $$
);
