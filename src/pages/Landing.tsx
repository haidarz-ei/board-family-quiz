import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Plus, LogIn, Loader2, ChevronDown } from "lucide-react";
import { createRoom, getRoomByCode } from "@/hooks/useRoom";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/contexts/SettingsContext";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAppSettings();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const room = await createRoom();
      toast({ title: t("landing.roomCreated"), description: `${t("landing.code")} ${room.code}` });
      navigate(`/room/${room.code}`);
    } catch (e) {
      toast({ title: t("landing.createFailed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) {
      toast({ title: t("landing.invalidCode") });
      return;
    }
    setLoading(true);
    const room = await getRoomByCode(c);
    setLoading(false);
    if (!room) {
      toast({ title: t("landing.roomNotFound"), variant: "destructive" });
      return;
    }
    navigate(`/room/${room.code}`);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden bg-slate-950 text-white">

      {/* Responsive Background Images - Full Opacity */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none hidden md:block"
        style={{ backgroundImage: "url(/img/bgDekstop.webp)" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none block md:hidden"
        style={{ backgroundImage: "url(/img/bgMobile.webp)" }}
      />

      {/* Subtle overlay for layout contrast */}
      <div className="fixed inset-0 bg-slate-950/25 z-0 pointer-events-none" />



      {/* Header Bar */}
      <header className="relative z-10 flex justify-between items-center px-8 py-5 select-none">
        {/* Empty placeholder since HPRO is pre-rendered in the background */}
        <div className="w-10 h-10" />

        {/* Transparent click targets over the pre-rendered background flags */}
        <div className="flex items-center gap-1.5 bg-transparent rounded-full px-2.5 py-1">
          <button
            className="w-7 h-7 rounded-full overflow-hidden opacity-0 cursor-pointer transition hover:scale-105 active:scale-95"
            title="English"
          >
            <span className="sr-only">English</span>
          </button>
          <button
            className="w-7 h-7 rounded-full overflow-hidden opacity-0 cursor-pointer transition hover:scale-105 active:scale-95"
            title="Indonesia"
          >
            <span className="sr-only">Indonesia</span>
          </button>
        </div>
      </header>

      {/* Hero Section (100vh) */}
      <div className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">

        {/* Logo Image Title */}
        <div className="text-center select-none max-w-4xl flex flex-col items-center justify-center font-black uppercase tracking-tight -mt-24 md:-mt-32">

          <img
            src="/img/logo.webp"
            alt="Family Fun Time"
            className="w-[90%] md:w-full max-w-[500px] md:max-w-[700px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-300 animate-scale-bounce"
          />

          {/* Subtitle / Deskripsi */}
          <p
            className="mt-6 md:mt-8 text-sm md:text-base font-bold tracking-widest text-gray-200 uppercase drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-sm animate-fade-up"
            style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
          >
            {t("landing.subtitle")}
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => document.getElementById('action-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-up cursor-pointer hover:opacity-80 transition-opacity"
          style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
        >
          <span className="text-[10px] md:text-xs text-white/70 font-bold tracking-widest uppercase mb-1 md:mb-2 animate-pulse">
            {t("landing.scrollDown")}
          </span>
          <ChevronDown className="w-8 h-8 text-white/70 animate-bounce" />
        </button>
      </div>

      {/* Action Section */}
      <div id="action-section" className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-12">

        {/* Action Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-2">

          {/* BUAT ROOM GLASS CARD */}
          <div className="bg-slate-950/65 backdrop-blur-xl border-2 border-blue-500/35 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-5">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-black tracking-wider flex items-center gap-2.5 text-blue-400 uppercase drop-shadow">
                <Plus className="w-6 h-6 text-blue-400 flex-shrink-0" />
                {t("landing.createNewEvent")}
              </h2>
              <p className="text-sm text-gray-200/90 leading-relaxed font-semibold">
                {t("landing.createDesc")}
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full btn-glossy-blue rounded-full py-4 px-6 flex items-center justify-center gap-3 text-white shadow-lg active:scale-95 disabled:opacity-50 mt-auto"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 text-yellow-300 drop-shadow flex-shrink-0" />
              )}
              <span className="text-lg font-black tracking-widest uppercase drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
                {t("landing.createNewEvent")}
              </span>
            </button>
          </div>

          {/* MASUK ROOM GLASS CARD */}
          <div className="bg-slate-950/65 backdrop-blur-xl border-2 border-purple-500/35 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-5">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-black tracking-wider flex items-center gap-2.5 text-purple-400 uppercase drop-shadow">
                <LogIn className="w-6 h-6 text-purple-400 flex-shrink-0" />
                {t("landing.joinRoom")}
              </h2>
              {/* <p className="text-sm text-gray-200/90 leading-relaxed font-semibold">
                Masukkan kode room dari host untuk membuka halaman Display di device lain. Halaman ini digunakan sebagai layar utama permainan dan akan menampilkan jawaban serta scoreboard
              </p> */}
              <p className="text-sm text-gray-200/90 leading-relaxed font-semibold">
                {t("landing.joinDesc")}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t("landing.enterCode")}
                className="w-full bg-slate-900/90 border-2 border-purple-500/40 focus:border-purple-400 text-yellow-400 placeholder:text-purple-500/35 uppercase tracking-widest text-center text-xl font-black rounded-xl py-3 shadow-inner outline-none transition duration-300"
                maxLength={8}
              />

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full btn-glossy-purple rounded-full py-4 px-6 flex items-center justify-center gap-3 text-white shadow-lg active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5 text-yellow-300 drop-shadow flex-shrink-0" />
                <span className="text-lg font-black tracking-widest uppercase drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
                  {t("landing.joinBtn")}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Cara Main & Fitur Button */}
        <button
          onClick={() => navigate("/how-to")}
          className="mt-6 bg-blue-950/50 hover:bg-blue-900/75 text-white font-extrabold tracking-wider text-[13px] border border-yellow-500/50 hover:border-yellow-400 rounded-lg px-6 py-2 flex items-center gap-2 shadow-lg transition-all duration-300 uppercase"
        >
          <BookOpen className="w-4 h-4 text-yellow-400" />
          {t("landing.howToPlay")}
        </button>

      </div>

      {/* Footer Lengkap */}
      <footer className="relative z-10 w-full py-6 mt-auto border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/40 tracking-wider">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>COPYRIGHT © {new Date().getFullYear()} FAMILY FUN TIME.</p>
            <p>ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">{t("landing.privacyPolicy")}</Link>
            <span className="text-white/20">|</span>
            <Link to="/about-us" className="hover:text-white transition-colors">{t("landing.aboutUs")}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;