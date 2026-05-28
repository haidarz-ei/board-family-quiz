// Room-scoped key helpers for Public mode.
// When roomCode is null, legacy global keys are used (Private mode).
const ROOM_KEY = 'familyfuntime-active-room';
const ROOM_ID_KEY = 'familyfuntime-active-room-id';

export function setActiveRoom(code: string | null) {
  if (code) sessionStorage.setItem(ROOM_KEY, code);
  else sessionStorage.removeItem(ROOM_KEY);
}

export function getActiveRoom(): string | null {
  try {
    return sessionStorage.getItem(ROOM_KEY);
  } catch {
    return null;
  }
}

export function setActiveRoomId(id: string | null) {
  if (id) sessionStorage.setItem(ROOM_ID_KEY, id);
  else sessionStorage.removeItem(ROOM_ID_KEY);
}

export function getActiveRoomId(): string | null {
  try {
    return sessionStorage.getItem(ROOM_ID_KEY);
  } catch {
    return null;
  }
}

export function stateKey(): string {
  const code = getActiveRoom();
  return code ? `familyfuntime-rooms/${code}/state` : 'familyfuntime-game-state';
}

export function audioKey(): string {
  const code = getActiveRoom();
  return code ? `familyfuntime-rooms/${code}/audio` : 'familyfuntime-audio-command';
}

export function broadcastChannelName(): string {
  const code = getActiveRoom();
  return code ? `familyfuntime-game-${code}` : 'familyfuntime-game';
}

export function localStorageKey(): string {
  const code = getActiveRoom();
  return code ? `familyfuntime-game-state-${code}` : 'familyfuntime-game-state';
}

export function hostTokenKey(code: string): string {
  return `familyfuntime-room-host-${code}`;
}

export function deviceIdKey(): string {
  return 'familyfuntime-device-id';
}

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(deviceIdKey());
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(deviceIdKey(), id);
  }
  return id;
}

export function detectDeviceName(): string {
  const ua = navigator.userAgent;
  // Quick heuristic
  let device = 'Unknown Device';
  if (/iPhone/.test(ua)) device = 'iPhone';
  else if (/iPad/.test(ua)) device = 'iPad';
  else if (/Android/.test(ua)) {
    const m = ua.match(/Android.*;\s*([^;)]+)\sBuild/);
    device = m ? m[1].trim() : 'Android Device';
  } else if (/Windows/.test(ua)) device = 'Windows Laptop';
  else if (/Macintosh/.test(ua)) device = 'Mac';
  else if (/Linux/.test(ua)) device = 'Linux Device';
  let browser = '';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';
  return browser ? `${device} (${browser})` : device;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}