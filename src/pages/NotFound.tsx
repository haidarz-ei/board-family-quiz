import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { useAppSettings } from "@/contexts/SettingsContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppSettings();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans select-none overflow-hidden bg-slate-950 text-white">

      {/* Fixed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none hidden md:block"
        style={{ backgroundImage: "url(/img/bgDekstop.webp)" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none block md:hidden"
        style={{ backgroundImage: "url(/img/bgMobile.webp)" }}
      />
      <div className="fixed inset-0 bg-slate-950/60 z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 animate-scale-bounce">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-400/40 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>

        <div>
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tight text-3d-custom leading-none">
            404
          </h1>
          <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-white/80 mt-2 drop-shadow">
            {t("notFound.pageNotFound")}
          </p>
        </div>

        <p className="text-sm md:text-base text-white/60 font-semibold max-w-sm leading-relaxed">
          {t("notFound.description")}
        </p>

        <button
          onClick={() => navigate("/")}
          className="btn-glossy-blue rounded-full py-4 px-8 flex items-center gap-3 text-white font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          <Home className="w-5 h-5 text-yellow-300" />
          {t("notFound.backToHome")}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
