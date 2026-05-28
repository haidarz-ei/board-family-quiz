import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Database, Lock, EyeOff, FileText } from "lucide-react";
import { useAppSettings } from "@/contexts/SettingsContext";

const Section = ({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) => (
  <div
    className="bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-up"
    style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
  >
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
    <h2 className="flex items-center gap-3 text-base font-black text-white uppercase tracking-wider mb-3">
      <span className="p-2 rounded-xl bg-white/10 text-blue-300 shrink-0">{icon}</span>
      {title}
    </h2>
    <div className="text-white/70 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useAppSettings();

  return (
    <div className="min-h-screen relative font-sans text-white flex flex-col">

      {/* Fixed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none hidden md:block"
        style={{ backgroundImage: "url(/img/bgDekstop.webp)" }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none block md:hidden"
        style={{ backgroundImage: "url(/img/bgMobile.webp)" }}
      />
      <div className="fixed inset-0 bg-slate-950/70 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 py-8 space-y-5 flex-1">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-wider uppercase group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("app.back")}
          </button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white drop-shadow">
              {t("privacy.title")}
            </h1>
            <p className="text-xs text-white/50 mt-0.5 font-semibold">
              {t("privacy.subtitle")}
            </p>
          </div>
          <div className="w-20" />
        </div>

        {/* Intro Banner */}
        <div className="animate-fade-up bg-blue-900/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden text-center" style={{ animationDelay: '0.03s', animationFillMode: 'both' }}>
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-sm md:text-base text-blue-100/90 font-semibold leading-relaxed max-w-2xl mx-auto">
            {t("privacy.intro")}
          </p>
        </div>

        {/* Sections */}

        <Section icon={<Database className="w-5 h-5" />} title={t("privacy.dataColTitle")} delay={0.1}>
          <p>{t("privacy.dataCol1")}</p>
          <p className="mt-2">{t("privacy.dataCol2")}</p>
        </Section>

        <Section icon={<Lock className="w-5 h-5" />} title={t("privacy.connTitle")} delay={0.15}>
          <p>{t("privacy.conn1")}</p>
          <p className="mt-2">{t("privacy.conn2")}</p>
        </Section>

        <Section icon={<EyeOff className="w-5 h-5" />} title={t("privacy.cookieTitle")} delay={0.2}>
          <p>{t("privacy.cookie1")}</p>
        </Section>

        <Section icon={<FileText className="w-5 h-5" />} title={t("privacy.policyTitle")} delay={0.25}>
          <p>{t("privacy.policy1")}</p>
          <p className="mt-2">{t("privacy.policy2")}</p>
        </Section>

        <div className="h-6" />
      </div>

      {/* Footer Singkat */}
      <footer className="relative z-10 w-full py-6 mt-auto border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-semibold text-white/40 tracking-wider">
          <p>COPYRIGHT © {new Date().getFullYear()} FAMILY FUN TIME.</p>
          <p>ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

    </div>
  );
};

export default Privacy;