-- Create game-audio bucket using minimal columns (compat mode)
INSERT INTO storage.buckets (id, name)
VALUES ('game-audio', 'game-audio')
ON CONFLICT (id) DO NOTHING;

-- Policies remain the same
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can read game-audio'
  ) THEN
    CREATE POLICY "Public can read game-audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'game-audio');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated can upload game-audio'
  ) THEN
    CREATE POLICY "Authenticated can upload game-audio"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'game-audio' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated can update game-audio'
  ) THEN
    CREATE POLICY "Authenticated can update game-audio"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'game-audio' AND auth.uid() IS NOT NULL)
    WITH CHECK (bucket_id = 'game-audio' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated can delete game-audio'
  ) THEN
    CREATE POLICY "Authenticated can delete game-audio"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'game-audio' AND auth.uid() IS NOT NULL);
  END IF;
END $$;