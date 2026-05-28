import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPanel as AdminPanelComponent } from "@/components/AdminPanel";
import { RoomShell } from "@/components/RoomShell";
import { getRoomByCode, isHost } from "@/hooks/useRoom";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/contexts/SettingsContext";

const AdminPanel = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAppSettings();
  const [ok, setOk] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const room = await getRoomByCode(code);
      if (!room) {
        toast({ title: t("room.roomNotFound"), variant: "destructive" });
        navigate("/");
        return;
      }

      setRoomId(room.id);
      setOk(true);
    })();
  }, [code, navigate, toast]);

  if (!ok) return null;
  return (
    <RoomShell code={code.toUpperCase()} roomId={roomId}>
      <AdminPanelComponent />
    </RoomShell>
  );
};

export default AdminPanel;