import { useState } from "react";
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Palette, 
  Info, 
  Music2, 
  Check, 
  ChevronDown, 
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useAppSettings } from "@/contexts/SettingsContext";
import type { DisplayTheme } from "@/contexts/SettingsContext";
import { useMusicPlayer, MUSIC_LIST } from "@/contexts/MusicContext";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

export const SettingsDialog = ({ trigger }: SettingsDialogProps) => {
  const { 
    language, 
    adminTheme, 
    displayTheme,
    setLanguage, 
    setAdminTheme, 
    setDisplayTheme,
    t
  } = useAppSettings();

  const { 
    currentTrackId, 
    isPlaying, 
    volume,
    setTrack, 
    togglePlay,
    setVolume
  } = useMusicPlayer();

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            className="p-2.5 rounded-full bg-slate-950/60 border border-white/15 text-white/80 hover:text-white hover:bg-slate-800/80 hover:border-white/30 backdrop-blur-md transition-all duration-300 hover:rotate-90 shadow-lg active:scale-95 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5 animate-pulse" />
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent
        className="
          sm:max-w-md
          w-[95vw]
          max-h-[92vh]
          overflow-y-auto
          bg-slate-950/90
          backdrop-blur-2xl
          border border-white/10
          text-white
          p-0
          rounded-3xl
          shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.15)]
          animate-in fade-in-50 zoom-in-95 duration-200
        "
      >
        {/* Glowing Top bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Modal Header */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-white font-black uppercase tracking-widest text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Settings className="w-5 h-5 text-blue-400 animate-[spin_10s_linear_infinite]" />
            </div>
            <span>{t("settings.title")}</span>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse ml-auto" />
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Bahasa / Language */}
          <div className="bg-white/[0.03] border border-white/10 hover:border-blue-500/20 rounded-2xl p-4.5 space-y-3 transition-all duration-300 group shadow-inner">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-blue-300 transition-colors">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{t("settings.language")}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage("id")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.97] cursor-pointer",
                  language === "id"
                    ? "bg-blue-600/35 border-blue-400/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] font-black"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/15 hover:text-white"
                )}
              >
                <span>🇮🇩 Indonesia</span>
                {language === "id" && <Check className="w-3.5 h-3.5 text-blue-300 shrink-0" />}
              </button>
              
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.97] cursor-pointer",
                  language === "en"
                    ? "bg-blue-600/35 border-blue-400/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] font-black"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/15 hover:text-white"
                )}
              >
                <span>🇬🇧 English</span>
                {language === "en" && <Check className="w-3.5 h-3.5 text-blue-300 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Admin Panel Mode / Dark Theme */}
          <div className="bg-white/[0.03] border border-white/10 hover:border-indigo-500/20 rounded-2xl p-4.5 space-y-3 transition-all duration-300 group shadow-inner">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-indigo-300 transition-colors">
              {adminTheme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
              <span>Admin Panel Theme</span>
            </div>
            
            <button
              onClick={() => setAdminTheme(adminTheme === "dark" ? "light" : "dark")}
              className="w-full flex items-center justify-between bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3.5 transition-all duration-300 cursor-pointer active:scale-[0.99] group/btn"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-white/90 group-hover/btn:text-white transition-colors">
                  {adminTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Active
                </span>
              </div>
              
              <div 
                className={cn(
                  "w-11 h-6 rounded-full border transition-all duration-300 relative flex items-center shadow-inner",
                  adminTheme === "dark" 
                    ? "bg-indigo-600 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                    : "bg-slate-700 border-slate-500"
                )}
              >
                <div 
                  className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 absolute",
                    adminTheme === "dark" ? "right-1" : "left-1"
                  )}
                />
              </div>
            </button>
          </div>

          {/* Display Theme */}
          <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/20 rounded-2xl p-4.5 space-y-3 transition-all duration-300 group shadow-inner">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-purple-300 transition-colors">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Display Theme</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold tracking-widest">
                SOON
              </span>
            </div>
            
            <div className="flex gap-2">
              {["classic", "neon", "glassphormism"].map((themeName) => (
                <button
                  key={themeName}
                  disabled
                  onClick={() => setDisplayTheme(themeName as DisplayTheme)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 cursor-not-allowed",
                    displayTheme === themeName
                      ? "bg-purple-600/30 border-purple-400/50 text-purple-200 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      : "bg-white/5 border-white/5 text-white/30"
                  )}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>

          {/* Music Player */}
          <div className="bg-white/[0.03] border border-white/10 hover:border-green-500/20 rounded-2xl p-4.5 space-y-3.5 transition-all duration-300 group shadow-inner">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-green-300 transition-colors">
              <div className="flex items-center gap-2">
                <Music2 className={cn("w-4 h-4 text-green-400", isPlaying && "animate-spin")} />
                <span>{t("settings.backgroundMusic")}</span>
              </div>
              
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-3 shrink-0">
                  <div className="w-[2px] h-3 bg-green-400 animate-[bounce_1.2s_infinite]"></div>
                  <div className="w-[2px] h-1.5 bg-green-400 animate-[bounce_0.8s_infinite]"></div>
                  <div className="w-[2px] h-2 bg-green-400 animate-[bounce_1s_infinite]"></div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              {/* Toggle Switch */}
              <button
                onClick={togglePlay}
                className={cn(
                  "shrink-0 px-4 flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer",
                  isPlaying 
                    ? "bg-green-600/20 border-green-500/40 hover:border-green-400/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
                )}
                title={isPlaying ? "Mute Music" : "Play Music"}
              >
                {isPlaying ? (
                  <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/40" />
                )}
              </button>

              {/* Track Selection */}
              <div className="relative flex-1">
                <select
                  value={currentTrackId}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white outline-none cursor-pointer hover:bg-slate-900/90 transition-all duration-300 pr-10"
                >
                  {MUSIC_LIST.map((track) => (
                    <option
                      key={track.id}
                      value={track.id}
                      className="bg-slate-950 text-white font-bold"
                    >
                      🎵 {track.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none group-hover:translate-y-[-3px] transition-transform duration-300" />
              </div>
            </div>

            {/* Volume Slider */}
            <div className="pt-2 px-1">
              <Slider
                value={[volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => setVolume(val[0] / 100)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* App Info */}
          <div className="flex items-center justify-between text-[10px] text-white/30 font-bold px-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Family Fun Time — v1.0.0</span>
            </div>
            <span className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full font-black">
              STABLE
            </span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
