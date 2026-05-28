import { ReactNode, useEffect, useState } from "react";
import { setActiveRoom, getActiveRoom, setActiveRoomId } from "@/lib/roomContext";

interface Props {
  code: string;
  roomId?: string;
  children: ReactNode;
}

// Activates a room context before children render and clears it on unmount.
export const RoomShell = ({ code, roomId, children }: Props) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setActiveRoom(code);
    if (roomId) setActiveRoomId(roomId);
    setReady(true);
    return () => {
      // Only clear if still ours
      if (getActiveRoom() === code) {
        setActiveRoom(null);
        setActiveRoomId(null);
      }
    };
  }, [code, roomId]);
  if (!ready) return null;
  return <>{children}</>;
};