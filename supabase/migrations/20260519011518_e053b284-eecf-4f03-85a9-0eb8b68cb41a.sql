
-- Rooms table for Public mode
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.room_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.room_state (
  room_id uuid PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_state ENABLE ROW LEVEL SECURITY;

-- Public access (no auth, security via host_token kept secret in localStorage)
CREATE POLICY "rooms_all" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "room_devices_all" ON public.room_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "room_state_all" ON public.room_state FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_state;

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_devices REPLICA IDENTITY FULL;
ALTER TABLE public.room_state REPLICA IDENTITY FULL;

CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_room_devices_room ON public.room_devices(room_id);
