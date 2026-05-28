import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateRoomCode, hostTokenKey, getOrCreateDeviceId, detectDeviceName } from "@/lib/roomContext";

export interface RoomDevice {
  id: string;
  device_name: string;
  joined_at: string;
}

export interface Room {
  id: string;
  code: string;
  host_token?: string;
  created_at: string;
}

export async function createRoom(): Promise<Room> {
  // Try a few times in case of code collision
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode();
    const { data, error } = await supabase.rpc("create_room", { p_code: code });
    if (!error && data) {
      // RPC returns JSONB with host_token included only at creation time
      const room = data as { id: string; code: string; host_token: string; created_at: string };
      localStorage.setItem(hostTokenKey(room.code), room.host_token);
      return room as Room;
    }
  }
  throw new Error("Gagal membuat room");
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase.rpc("get_room_by_code", { p_code: code.toUpperCase() });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  // RPC returns array of rows; take the first one. host_token is NOT included.
  const row = Array.isArray(data) ? data[0] : data;
  return row as Room;
}

export async function joinRoomAsDevice(roomId: string): Promise<string | null> {
  const deviceName = detectDeviceName();
  const { data } = await supabase.from("room_devices").insert({
    room_id: roomId,
    device_name: deviceName,
  }).select("id").single();
  return data?.id || null;
}

export async function removeRoomDevice(deviceId: string): Promise<void> {
  await supabase.from("room_devices").delete().eq("id", deviceId);
}

export function isHost(code: string, hostToken?: string): boolean {
  const stored = localStorage.getItem(hostTokenKey(code));
  if (!stored) return false;
  if (hostToken) return stored === hostToken;
  return true;
}

export function useRoomDevices(roomId: string | null) {
  const [devices, setDevices] = useState<RoomDevice[]>([]);

  const refresh = useCallback(async () => {
    if (!roomId) return;
    const { data } = await supabase
      .from("room_devices")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (data) setDevices(data as RoomDevice[]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    refresh();
    const channel = supabase
      .channel(`room-devices-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_devices", filter: `room_id=eq.${roomId}` },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refresh]);

  return devices;
}

export { getOrCreateDeviceId };