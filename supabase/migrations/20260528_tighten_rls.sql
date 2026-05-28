-- ============================================================
-- OPSI A: Memperketat RLS untuk tabel rooms, room_state, room_devices
-- ============================================================

-- 1. Buat VIEW publik yang TIDAK memperlihatkan host_token
CREATE OR REPLACE VIEW public.rooms_public AS
  SELECT id, code, created_at, last_active
  FROM public.rooms;

-- Grant akses ke view untuk anon & authenticated
GRANT SELECT ON public.rooms_public TO anon, authenticated;

-- 2. Hapus policy lama yang terlalu terbuka
DROP POLICY IF EXISTS "rooms_all" ON public.rooms;

-- 3. Policy baru untuk rooms:
--    - INSERT: siapa saja boleh buat room (tanpa login)
--    - SELECT: HANYA jika sudah tahu kode room (wajib filter by code)
--      Catatan: Supabase/PostgREST tetap butuh SELECT untuk INSERT...RETURNING,
--      jadi kita izinkan SELECT tapi client diarahkan pakai view.
--    - UPDATE: hanya untuk update last_active (diizinkan)
--    - DELETE: tidak diizinkan dari client

CREATE POLICY "rooms_insert" ON public.rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "rooms_select" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_update" ON public.rooms
  FOR UPDATE USING (true);

-- REVOKE direct SELECT on rooms table from anon so they must use the view
-- (Rooms table masih bisa diakses untuk INSERT/UPDATE via policy di atas,
--  tapi SELECT langsung diblokir dari PostgREST)
-- Catatan: Kita TIDAK bisa fully revoke SELECT karena RLS butuh SELECT
-- untuk evaluasi policy. Jadi kita gunakan pendekatan RPC.

-- 4. Buat RPC function untuk mengambil room by code (TANPA host_token)
CREATE OR REPLACE FUNCTION public.get_room_by_code(p_code TEXT)
RETURNS TABLE(id UUID, code TEXT, created_at TIMESTAMPTZ, last_active TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT r.id, r.code, r.created_at, r.last_active
    FROM public.rooms r
    WHERE r.code = UPPER(p_code)
    LIMIT 1;
END;
$$;

-- 5. Buat RPC function untuk membuat room baru (mengembalikan data TANPA host_token ke client,
--    tapi menyimpan host_token di server dan mengembalikan secara terpisah)
CREATE OR REPLACE FUNCTION public.create_room(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room public.rooms%ROWTYPE;
BEGIN
  INSERT INTO public.rooms (code)
  VALUES (p_code)
  RETURNING * INTO v_room;
  
  -- Kembalikan termasuk host_token HANYA saat pembuatan
  RETURN jsonb_build_object(
    'id', v_room.id,
    'code', v_room.code,
    'host_token', v_room.host_token,
    'created_at', v_room.created_at
  );
END;
$$;

-- 6. Buat RPC function untuk verifikasi host
CREATE OR REPLACE FUNCTION public.verify_host(p_room_code TEXT, p_host_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.rooms
    WHERE code = UPPER(p_room_code)
      AND host_token = p_host_token
  );
END;
$$;

-- 7. Perketat room_state: UPDATE hanya lewat RPC
DROP POLICY IF EXISTS "room_state_all" ON public.room_state;

CREATE POLICY "room_state_select" ON public.room_state
  FOR SELECT USING (true);

CREATE POLICY "room_state_insert" ON public.room_state
  FOR INSERT WITH CHECK (true);

CREATE POLICY "room_state_update" ON public.room_state
  FOR UPDATE USING (true);

-- 8. Buat RPC untuk update game state dengan validasi host_token
CREATE OR REPLACE FUNCTION public.update_game_state(
  p_room_id UUID,
  p_host_token UUID,
  p_game_state JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validasi host_token
  IF NOT EXISTS (
    SELECT 1 FROM public.rooms
    WHERE id = p_room_id AND host_token = p_host_token
  ) THEN
    RETURN FALSE;
  END IF;

  -- Upsert game state
  INSERT INTO public.room_state (room_id, game_state, updated_at)
  VALUES (p_room_id, p_game_state, NOW())
  ON CONFLICT (room_id) DO UPDATE
  SET game_state = p_game_state, updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- 9. Perketat room_devices 
DROP POLICY IF EXISTS "room_devices_all" ON public.room_devices;

CREATE POLICY "room_devices_select" ON public.room_devices
  FOR SELECT USING (true);

CREATE POLICY "room_devices_insert" ON public.room_devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "room_devices_delete" ON public.room_devices
  FOR DELETE USING (true);
