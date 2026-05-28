import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { getRoomByCode, isHost, useRoomDevices, removeRoomDevice, joinRoomAsDevice, type Room as RoomType } from "@/hooks/useRoom";
import { ArrowLeft, Copy, Monitor, Settings, Share2, Smartphone, Users, Trash2, QrCode, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppSettings } from "@/contexts/SettingsContext";

const Room = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAppSettings();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [qr, setQr] = useState<string>("");
  const [host, setHost] = useState(false);
  const devices = useRoomDevices(room?.id || null);

  const hasJoined = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getRoomByCode(code);
      if (!r) {
        toast({ title: t("room.roomNotFound"), variant: "destructive" });
        navigate("/");
        return;
      }
      const isHostUser = isHost(r.code);
      setRoom(r);
      setHost(isHostUser);

      if (!hasJoined.current) {
        hasJoined.current = true;
        try {
          const devId = await joinRoomAsDevice(r.id);
          if (devId) {
            sessionStorage.setItem('current-device-id', devId);
            channelRef.current = supabase.channel(`kick-${devId}`)
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

      const joinUrl = `${window.location.origin}/room/${r.code}`;
      const dataUrl = await QRCode.toDataURL(joinUrl, { width: 240, margin: 1 });
      setQr(dataUrl);
    })();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [code, navigate, toast]);

  // Helper for copying text (works on HTTP LAN / insecure context)
  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({ title: successMsg });
      } else {
        // Fallback for insecure context (e.g. LAN IP testing)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast({ title: successMsg });
        } catch (err) {
          toast({ title: t("room.copyFailed"), variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: t("room.copyFailed"), variant: "destructive" });
    }
  };

  const copyCode = () => {
    copyToClipboard(code, t("room.codeCopied"));
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/room/${code}`;
    // navigator.share requires HTTPS. If on LAN (HTTP), it is undefined.
    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title: "Join Family Fun Time",
          text: `Ayo bergabung ke game Family Fun Time! Kode Room: ${code}`,
          url: url,
        });
      } catch (err) {
        // Ignored, user closed share dialog
      }
    } else {
      // Fallback if device doesn't support share or is on insecure context
      copyToClipboard(url, t("room.shareNotSupported"));
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await removeRoomDevice(deviceId);
      toast({ title: t("room.deviceRemoved") });
    } catch (error) {
      toast({ title: t("room.deviceRemoveFailed"), variant: "destructive" });
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden bg-slate-950 text-white">

      {/* Fixed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none hidden md:block"
        style={{ backgroundImage: "url(/img/bgDekstop.webp)" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none block md:hidden"
        style={{ backgroundImage: "url(/img/bgMobile.webp)" }}
      />
      <div className="fixed inset-0 bg-slate-950/50 z-0 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 animate-fade-up gap-2 md:gap-0">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-wider uppercase group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("room.back")}
        </Link>
        <h1 className="text-lg md:text-2xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {t("room.dashboard")}
        </h1>
        <div className="hidden md:block w-20" />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-5xl mx-auto w-full">

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>

          {/* Room Code Card */}
          <div className="bg-slate-950/65 backdrop-blur-xl border-2 border-blue-500/35 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 h-full">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
            <h2 className="text-base font-black tracking-wider text-blue-400 uppercase flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {t("room.roomCode")}
            </h2>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl md:text-5xl font-black tracking-[0.3em] text-center bg-black/40 border border-white/10 rounded-xl py-4 text-yellow-300 drop-shadow-[0_2px_8px_rgba(253,224,71,0.4)]">
                {room.code}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" /> <span className="hidden md:inline">{t("room.copy")}</span>
              </button>
              <button
                onClick={shareLink}
                className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">{t("room.share")}</span>
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95">
                    <QrCode className="w-3.5 h-3.5" /> <span className="hidden md:inline">{t("room.qrCode")}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-950 border border-indigo-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-center font-black tracking-widest uppercase text-indigo-400">{t("room.scanQr")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-4">
                    {qr ? (
                      <div className="bg-white p-3 rounded-2xl shadow-xl">
                        <img src={qr} alt="QR Code" className="w-48 h-48" />
                      </div>
                    ) : null}
                    <p className="mt-4 text-xs text-white/60 font-semibold uppercase tracking-widest text-center px-4">
                      {t("room.scanDesc")}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Connected Devices Card */}
          <div className="bg-slate-950/65 backdrop-blur-xl border-2 border-purple-500/35 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 h-[240px] md:h-[260px]">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
            <h2 className="text-base font-black tracking-wider text-purple-400 uppercase flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t("room.connectedDevices")}
              <span className="ml-auto bg-purple-500/30 border border-purple-400/40 text-purple-300 text-xs font-black rounded-full px-3 py-0.5">
                {devices.length}
              </span>
            </h2>
            {devices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2 text-center">
                <Smartphone className="w-10 h-10 text-white/20" />
                <p className="text-white/50 text-xs font-semibold leading-relaxed" dangerouslySetInnerHTML={{ __html: t("room.noDevices") }} />
              </div>
            ) : (
              <ul className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {devices.map((d) => (
                  <li key={d.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl px-3 py-2.5 text-sm group">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-xs">{d.device_name}</span>
                      <span className="text-[10px] text-white/50 font-semibold">
                        {new Date(d.joined_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(d.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                      title={t("room.removeDevice")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Warning Box */}
        {host && (
          <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3 shadow-lg animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="p-2 bg-yellow-500/20 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wide mb-0.5">{t("room.important")}</h3>
              <p className="text-xs text-yellow-200/80 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: t("room.importantDesc") }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full animate-fade-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          {/* Admin Panel Button */}
          <button
            onClick={() => navigate(`/admin/${room.code}`)}
            className="w-full btn-glossy-blue rounded-2xl py-7 px-6 flex flex-col items-center justify-center gap-3 text-white shadow-xl transition-all duration-300 active:scale-95 relative overflow-hidden"
          >

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-md">
              <Settings className="w-6 h-6 text-blue-950 animate-[spin_6s_linear_infinite]" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t("room.adminPanel")}
            </span>
            <span className="text-[11px] font-bold text-blue-200/80 uppercase tracking-wider">
              {t("room.adminPanelDesc")}
            </span>
          </button>

          <button
            onClick={() => window.open(`/display/${room.code}`, "_blank")}
            className="w-full btn-glossy-purple rounded-2xl py-7 px-6 flex flex-col items-center justify-center gap-3 text-white shadow-xl transition-all duration-300 active:scale-95"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-md">
              <Monitor className="w-6 h-6 text-blue-950" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t("room.display")}
            </span>
            <span className="text-[11px] font-bold text-purple-200/80 uppercase tracking-wider">
              {t("room.displayDesc")}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Room;