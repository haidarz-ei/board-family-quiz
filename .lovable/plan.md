## Ringkasan
Tambah landing page dengan pilihan **Private** / **Public** mode + halaman tutorial. Public mode pakai room system (Supabase Realtime), Private mode pakai sistem lama (IP/LAN).

## Struktur Route Baru
```
/                       → Landing baru (pilih Private/Public + tombol "Cara Main")
/how-to                 → Halaman tutorial lengkap
/private                → Hub Private (tombol Admin Panel & Display, info IP)
/private/admin          → Admin Panel (existing)
/private/display        → Display (existing)
/public                 → Hub Public (Buat Room / Join Room)
/public/room/:code      → Room dashboard host (room code, QR, daftar device, link Admin/Display)
/public/admin/:code     → Admin Panel — hanya host (cek localStorage host token)
/public/display/:code   → Display via room code (siapapun)
/public/join            → Form input room code → redirect ke /public/display/:code
```

## Database (Supabase)
Tabel baru:
- **`rooms`**: `id`, `code` (unique 6 char), `host_token` (uuid, secret), `created_at`, `last_active`
- **`room_devices`**: `id`, `room_id`, `device_name` (parsed dari user-agent), `joined_at`
- **`room_state`**: `room_id` (PK), `game_state` (jsonb) — untuk sinkronisasi game state per room

RLS: public read+insert untuk `rooms` (untuk join by code), `room_devices` (insert untuk join), `room_state` (read+update). Tidak ada auth, jadi `host_token` jadi proteksi akses admin (disimpan di localStorage device pembuat).

## Komponen Baru
- `src/pages/Landing.tsx` — pilih mode
- `src/pages/HowTo.tsx` — tutorial (private vs public, IP, room code, keamanan, realtime)
- `src/pages/PrivateHub.tsx` — tombol Admin Panel / Display + tampil IP lokal & instruksi WiFi
- `src/pages/PublicHub.tsx` — tombol "Buat Room" / "Masuk Room" (Admin & Display disabled/blur sebelum ada room)
- `src/pages/PublicRoom.tsx` — host dashboard: room code, QR (pakai lib `qrcode`), daftar device realtime, link buka Admin/Display
- `src/pages/PublicAdmin.tsx` — wrap AdminPanel, validasi host_token, scope state ke room
- `src/pages/PublicDisplay.tsx` — wrap DisplayView, scope state ke room
- `src/pages/PublicJoin.tsx` — input code → push device → redirect ke display
- `src/hooks/useRoom.ts` — create/join/subscribe room
- `src/hooks/useRoomGameState.ts` — sinkronisasi state via Supabase Realtime per room

## Refactor Existing
- `AdminPanel` & `DisplayView`: terima prop `roomCode?` agar bisa pakai channel Supabase Realtime per room. Tanpa prop = mode lama (BroadcastChannel/localStorage/Firebase) untuk Private.
- Pisahkan logic state agar bisa di-share di kedua mode.

## UI/UX
- Glassmorphism konsisten dengan landing existing
- Public hub: Admin/Display button = `opacity-40 blur-sm pointer-events-none` sebelum room dibuat
- Room page: list device realtime ("Samsung A15 — joined 19:21")
- QR code generated client-side via `qrcode` library

## Catatan Keamanan
- Host token disimpan di `localStorage[`room_${code}_host`]`
- `/public/admin/:code` cek token, jika tidak match → redirect ke display
- Room code = display only; admin route butuh token

## Yang Tidak Berubah
- Sistem Private (BroadcastChannel/Firebase existing) tetap jalan untuk LAN
- Game logic (5 rounds, strikes, dll) tidak diubah
- Audio system tidak diubah

Setelah disetujui, saya akan: (1) jalankan migration, (2) buat halaman baru, (3) refactor minimal AdminPanel/DisplayView untuk dukung roomCode, (4) install `qrcode` lib.
