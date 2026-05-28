import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// ============================================================
// MUSIC LIST — Hanya developer yang menambahkan musik baru di sini.
// Letakkan file musik di folder: public/music/
// Format yang didukung: .mp3, .ogg, .wav
// ============================================================
export const MUSIC_LIST = [
  { id: "music-a", label: "Ikon Game", src: "/music/music-a.mp3" },
  { id: "music-b", label: "Sunny Day", src: "/music/music-b.mp3" },
  { id: "music-c", label: "Excited", src: "/music/music-c.mp3" },
];

// Routes dimana musik harus diam (paused)
const MUTED_ROUTES = ["/display", "/admin"];

interface MusicContextValue {
  currentTrackId: string;
  isPlaying: boolean;
  volume: number;
  setTrack: (id: string) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export const useMusicPlayer = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used inside MusicProvider");
  return ctx;
};

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist settings in localStorage
  const [currentTrackId, setCurrentTrackId] = useState<string>(() => {
    return localStorage.getItem("music_track") || MUSIC_LIST[0].id;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    const stored = localStorage.getItem("music_playing");
    return stored === null ? true : stored === "true";
  });
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem("music_volume");
    return stored ? parseFloat(stored) : 0.35;
  });

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem("music_volume", vol.toString());
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  // Determine if current route should silence music
  const isMutedRoute = MUTED_ROUTES.some(route => location.pathname.startsWith(route));

  // Init audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update src when track changes (initialization fallback)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = MUSIC_LIST.find((m) => m.id === currentTrackId);
    if (!track) return;

    // Only update if different to avoid reloading during synchronous setTrack
    if (!audio.src.includes(track.src)) {
      audio.src = track.src;
      audio.load();
      if (isPlaying && !isMutedRoute) {
        audio.play().catch(() => { });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackId]);
  // Handle play/pause based on isPlaying + muted route
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isMutedRoute) {
      // Browser requires user interaction before autoplay — use a promise and silence rejection
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  }, [isPlaying, isMutedRoute]);

  // Autoplay on first user interaction (handles browser autoplay policy)
  useEffect(() => {
    if (!isPlaying || isMutedRoute) return;

    const tryPlay = () => {
      audioRef.current?.play().catch(() => { });
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("keydown", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };

    document.addEventListener("click", tryPlay, { once: true });
    document.addEventListener("keydown", tryPlay, { once: true });
    document.addEventListener("touchstart", tryPlay, { once: true });

    return () => {
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("keydown", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, [isPlaying, isMutedRoute]);

  const setTrack = useCallback((id: string) => {
    setCurrentTrackId(id);
    localStorage.setItem("music_track", id);

    // Synchronous playback for mobile
    const audio = audioRef.current;
    if (audio) {
      const track = MUSIC_LIST.find((m) => m.id === id);
      if (track) {
        audio.src = track.src;
        audio.load();
        if (isPlaying && !isMutedRoute) {
          audio.play().catch(() => { });
        }
      }
    }
  }, [isPlaying, isMutedRoute]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      localStorage.setItem("music_playing", String(next));

      // Sinkron memutar audio saat tombol diklik (menghindari blokir autoplay di iOS/Android)
      if (audioRef.current) {
        if (next && !isMutedRoute) {
          audioRef.current.play().catch(() => { });
        } else {
          audioRef.current.pause();
        }
      }
      return next;
    });
  }, [isMutedRoute, volume]);

  return (
    <MusicContext.Provider value={{ currentTrackId, isPlaying, volume, setTrack, togglePlay, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
};
