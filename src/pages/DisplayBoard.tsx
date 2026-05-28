import { useEffect, useState, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useParams, useNavigate } from "react-router-dom";
import { DisplayView } from "@/components/DisplayView";
import { RoomShell } from "@/components/RoomShell";
import { LandscapeWrapper } from "@/components/LandscapeWrapper";
import { getRoomByCode } from "@/hooks/useRoom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/contexts/SettingsContext";

const DisplayBoard = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAppSettings();
  const [ok, setOk] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const hasJoined = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    (async () => {
      const room = await getRoomByCode(code);
      if (!room) {
        toast({ title: t("room.roomNotFound"), variant: "destructive" });
        navigate("/");
        return;
      }
      if (!hasJoined.current) {
        hasJoined.current = true;
        try { 
          const devId = sessionStorage.getItem('current-device-id'); 
          if (devId) {
            channelRef.current = supabase.channel(`kick-display-${devId}`)
              .on(
                "postgres_changes", 
                { event: "DELETE", schema: "public", table: "room_devices", filter: `id=eq.${devId}` }, 
                () => {
                  toast({ title: t("room.kicked"), variant: "destructive" });
                  navigate("/");
                }
              ).subscribe();
          }
        } catch (e) { /* ignore */ }
      }
      setRoomId(room.id);
      setOk(true);
    })();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [code, navigate, toast]);

  if (!ok) return null;
  return (
    <RoomShell code={code.toUpperCase()} roomId={roomId}>
      <LandscapeWrapper>
        <DisplayView />
      </LandscapeWrapper>
    </RoomShell>
  );
};

export default DisplayBoard;