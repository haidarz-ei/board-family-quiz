import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getActiveRoom, getActiveRoomId } from "./roomContext";

declare global {
  interface Window {
    __syncChannels?: Map<string, RoomChannel>;
    __syncPollTimers?: Map<string, ReturnType<typeof setInterval>>;
  }
}

function roomKey(): string {
  return getActiveRoom() || "PRIVATE";
}

function channelName(): string {
  return `familyfuntime:${roomKey()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StateCb = (payload: any) => void;
type AudioCb = (payload: { audioType: string; timestamp: number } | null) => void;

interface RoomChannel {
  channel: RealtimeChannel;
  stateCbs: Set<StateCb>;
  audioCbs: Set<AudioCb>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastState: any;
  lastStateJson: string;
  ready: Promise<void>;
  pollCount: number;
}

const globalChannels = window.__syncChannels || new Map<string, RoomChannel>();
window.__syncChannels = globalChannels;

const globalPollTimers = window.__syncPollTimers || new Map<string, ReturnType<typeof setInterval>>();
window.__syncPollTimers = globalPollTimers;

// Debug info exposed to UI
export const syncStatus = {
  channelName: '',
  roomId: '',
  pollCount: 0,
  lastPollResult: '',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getChannel(): RoomChannel {
  const name = channelName();
  let entry = globalChannels.get(name);
  if (entry) return entry;

  const roomId = getActiveRoomId();
  syncStatus.channelName = name;
  syncStatus.roomId = roomId || 'none';
  console.log(`[Sync] Channel: ${name}, roomId: ${roomId || 'none'}`);

  const ch = supabase.channel(name, {
    config: { broadcast: { self: true, ack: false } },
  });

  const stateCbs = new Set<StateCb>();
  const audioCbs = new Set<AudioCb>();

  // Sorted stringify for reliable dedup (JSONB sorts keys, broadcast doesn't)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stableStringify = (obj: any): string =>
    JSON.stringify(obj, (_, v) =>
      v && typeof v === "object" && !Array.isArray(v)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Object.keys(v).sort().reduce((o: any, k) => { o[k] = v[k]; return o; }, {})
        : v
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifyState = (payload: any, source: string) => {
    if (!payload) return;
    
    // Prevent stale DB polls from reverting state and causing double sounds
    if (entry!.lastState && payload._updatedAt && entry!.lastState._updatedAt) {
      if (payload._updatedAt < entry!.lastState._updatedAt) {
        console.log(`[Sync] Ignored stale update from ${source}`);
        return;
      }
    }

    const json = stableStringify(payload);
    if (json === entry!.lastStateJson) return;
    console.log(`[Sync] UPDATE from ${source}`);
    entry!.lastState = payload;
    entry!.lastStateJson = json;
    stateCbs.forEach((cb) => cb(payload));
  };

  ch.on("broadcast", { event: "state" }, ({ payload }) => {
    notifyState(payload, "broadcast");
  });
  ch.on("broadcast", { event: "audio" }, ({ payload }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioCbs.forEach((cb) => cb(payload as any));
  });
  ch.on("broadcast", { event: "request-state" }, () => {
    if (entry!.lastState) {
      ch.send({ type: "broadcast", event: "state", payload: entry!.lastState });
    }
  });

  const ready = new Promise<void>((resolve) => {
    ch.subscribe((status) => {
      console.log(`[Sync] Channel ${name}: ${status}`);
      if (status === "SUBSCRIBED") resolve();
    });
  });

  entry = {
    channel: ch,
    stateCbs,
    audioCbs,
    lastState: null,
    lastStateJson: "",
    ready,
    pollCount: 0,
  };
  globalChannels.set(name, entry);

  // --- Start persistent DB polling (Public mode) ---
  if (roomId && !globalPollTimers.has(name)) {
    console.log(`[Sync] Starting persistent poll for room ${roomId.slice(0, 8)}`);

    const pollFromDb = async () => {
      if (!entry) return;
      entry.pollCount++;
      syncStatus.pollCount = entry.pollCount;
      try {
        const url = `${SUPABASE_URL}/rest/v1/room_state?room_id=eq.${roomId}&select=game_state`;
        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
        if (!res.ok) {
          syncStatus.lastPollResult = `ERR ${res.status}`;
          return;
        }
        const rows = await res.json();
        if (rows.length > 0 && rows[0].game_state) {
          syncStatus.lastPollResult = `OK #${entry.pollCount}`;
          notifyState(rows[0].game_state, "poll");
        } else {
          syncStatus.lastPollResult = `empty #${entry.pollCount}`;
        }
      } catch (e) {
        syncStatus.lastPollResult = `FAIL`;
      }
    };

    // Poll immediately then every 2 seconds
    pollFromDb();
    const timer = setInterval(pollFromDb, 2000);
    globalPollTimers.set(name, timer);
  }

  return entry;
}

export function subscribeGameState(cb: StateCb): () => void {
  const entry = getChannel();
  entry.stateCbs.add(cb);
  // Replay last known state
  if (entry.lastState) cb(entry.lastState);
  return () => {
    entry.stateCbs.delete(cb);
    // NOTE: never clear poll timer - it must survive HMR re-mounts
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publishGameState(state: any): Promise<void> {
  const entry = getChannel();
  const json = JSON.stringify(state);
  entry.lastState = state;
  entry.lastStateJson = json;

  const roomId = getActiveRoomId();

  // 1. Broadcast (fast)
  await entry.ready;
  entry.channel
    .send({ type: "broadcast", event: "state", payload: state })
    .catch((e) => console.error(`[Sync] Broadcast error:`, e));

  // 2. DB upsert (reliable, Public mode)
  if (roomId) {
    try {
      const activeCode = getActiveRoom();
      const hostToken = activeCode ? localStorage.getItem(hostTokenKey(activeCode)) : null;

      if (!hostToken) {
        console.error(`[Sync] Cannot save state to DB: Not host (no token)`);
        return;
      }

      const { data, error } = await supabase.rpc("update_game_state", {
        p_room_id: roomId,
        p_host_token: hostToken,
        p_game_state: state,
      });

      if (error || !data) {
        console.error(`[Sync] DB upsert failed or denied by RPC:`, error);
      }
    } catch (e) {
      console.error(`[Sync] DB upsert error:`, e);
    }
  }
}

export function subscribeAudioCommand(cb: AudioCb): () => void {
  const entry = getChannel();
  entry.audioCbs.add(cb);
  return () => {
    entry.audioCbs.delete(cb);
  };
}

export async function publishAudioCommand(audioType: string): Promise<void> {
  const entry = getChannel();
  await entry.ready;
  await entry.channel.send({
    type: "broadcast",
    event: "audio",
    payload: { audioType, timestamp: Date.now() },
  });
}