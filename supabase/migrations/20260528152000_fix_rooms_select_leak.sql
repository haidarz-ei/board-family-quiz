-- ============================================================
-- FIX: Mencabut hak akses public SELECT langsung ke tabel rooms
-- ============================================================
-- Alasan: 
-- Sebelumnya ada policy "rooms_select" dengan USING (true).
-- Hal ini membuat semua user (anon/authenticated) bisa mengeksekusi
-- SELECT * FROM rooms via Supabase REST API dan mencuri `host_token`.
--
-- Karena frontend (React) sudah menggunakan RPC `get_room_by_code`
-- dan view `rooms_public` untuk membaca data room, kita bisa
-- dengan aman menghapus policy select yang bocor ini.

-- 1. Hapus policy SELECT yang berbahaya
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;

-- 2. Secara eksplisit larang (revoke) PostgREST untuk melakukan SELECT
-- langsung ke tabel `rooms` bagi user anon dan authenticated. 
-- Catatan: RPC dengan SECURITY DEFINER akan tetap bisa mengakses tabel ini.
REVOKE SELECT ON public.rooms FROM anon;
REVOKE SELECT ON public.rooms FROM authenticated;

-- Pastikan mereka masih bisa menggunakan view `rooms_public` 
GRANT SELECT ON public.rooms_public TO anon, authenticated;
