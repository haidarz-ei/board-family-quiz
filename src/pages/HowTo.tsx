import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MonitorSmartphone,
  Plus,
  LogIn,
  LayoutDashboard,
  Settings,
  Gamepad2,
  List,
  Users,
  Volume2,
  Music
} from "lucide-react";
import { useAppSettings } from "@/contexts/SettingsContext";

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-up" style={{ animationFillMode: 'both' }}>
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
    <h2 className="flex items-center gap-3 text-base md:text-lg font-black text-white uppercase tracking-wider mb-4">
      <span className="p-2 rounded-xl bg-white/10 text-blue-300 shrink-0">{icon}</span>
      {title}
    </h2>
    <div className="text-white/80 space-y-3 leading-relaxed text-sm md:text-base">
      {children}
    </div>
  </div>
);

const HowTo = () => {
  const { t } = useAppSettings();

  return (
    <div className="min-h-screen relative font-sans text-white pb-10">

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

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-wider uppercase group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("app.back")}
          </Link>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white drop-shadow">
            {t("howTo.title")}
          </h1>
          <div className="w-20" />
        </div>

        {/* Feature Highlight Card */}
        <div
          className="bg-blue-900/40 border border-blue-500/40 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-xl flex items-start gap-4 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rounded-t-2xl" />
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300 shrink-0">
            <MonitorSmartphone className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-black text-blue-300 uppercase tracking-wider">
              {t("howTo.heroTitle")}
            </h3>
            <p className="text-white/85 font-semibold leading-relaxed text-sm md:text-base">
              {t("howTo.heroDesc")}
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section icon={<Plus className="w-5 h-5" />} title={t("howTo.sec1Title")}>
            <p>{t("howTo.sec1P1")}</p>
            <p>{t("howTo.sec1P2")}</p>
            <p>{t("howTo.sec1P3")}</p>
            <p className="bg-white/10 p-3 rounded-lg border border-white/20 text-sm">
              {t("howTo.sec1Tip")}
            </p>
          </Section>

          <Section icon={<LogIn className="w-5 h-5" />} title={t("howTo.sec2Title")}>
            <p>{t("howTo.sec2P1")}</p>
            <p>{t("howTo.sec2P2")}</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-2 text-white/80">
              <li>{t("howTo.sec2L1")}</li>
              <li>{t("howTo.sec2L2")}</li>
              <li>{t("howTo.sec2L3")}</li>
              <li>{t("howTo.sec2L4")}</li>
            </ol>
            <p className="bg-yellow-500/20 text-yellow-200 p-3 rounded-lg border border-yellow-500/30 text-sm">
              {t("howTo.sec2Warn")}
            </p>
          </Section>

          <Section icon={<LayoutDashboard className="w-5 h-5" />} title={t("howTo.sec3Title")}>
            <p>{t("howTo.sec3P1")}</p>

            <h3 className="font-bold text-white mt-4">{t("howTo.sec3H1")}</h3>
            <p>{t("howTo.sec3P2")}</p>

            <h3 className="font-bold text-white mt-4">{t("howTo.sec3H2")}</h3>
            <p>{t("howTo.sec3P3")}</p>

            <h3 className="font-bold text-white mt-4">{t("howTo.sec3H3")}</h3>
            <p>{t("howTo.sec3P4")}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-white/80">
              <li>{t("howTo.sec3L1")}</li>
              <li>{t("howTo.sec3L2")}</li>
            </ul>
          </Section>

          <Section icon={<Settings className="w-5 h-5" />} title={t("howTo.sec4Title")}>
            <p>{t("howTo.sec4P1")}</p>
            <p>{t("howTo.sec4P2")}</p>
          </Section>

          <div className="ml-0 md:ml-6 space-y-4 border-l-2 border-white/10 pl-4 md:pl-6">
            <Section icon={<Gamepad2 className="w-5 h-5" />} title={t("howTo.tab1Title")}>
              <p>{t("howTo.tab1P1")}</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                <li>{t("howTo.tab1L1")}</li>
                <li>{t("howTo.tab1L2")}</li>
                <li>{t("howTo.tab1L3")}</li>
                <li>{t("howTo.tab1L4")}</li>
                <li>{t("howTo.tab1L5")}</li>
              </ul>
            </Section>

            <Section icon={<List className="w-5 h-5" />} title={t("howTo.tab2Title")}>
              <p>{t("howTo.tab2P1")}</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                <li>{t("howTo.tab2L1")}</li>
                <li>{t("howTo.tab2L2")}</li>
                <li>{t("howTo.tab2L3")}</li>
                <li>{t("howTo.tab2L4")}</li>
                <li>{t("howTo.tab2L5")}</li>
              </ul>
            </Section>

            <Section icon={<Users className="w-5 h-5" />} title={t("howTo.tab3Title")}>
              <p>{t("howTo.tab3P1")}</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                <li>{t("howTo.tab3L1")}</li>
                <li>{t("howTo.tab3L2")}</li>
              </ul>
              <p className="bg-white/10 p-3 rounded-lg border border-white/20 text-xs">
                {t("howTo.tab3Tip")}
              </p>
            </Section>

            <Section icon={<Volume2 className="w-5 h-5" />} title={t("howTo.tab4Title")}>
              <p>{t("howTo.tab4P1")}</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                <li>{t("howTo.tab4L1")}</li>
                <li>{t("howTo.tab4L2")}</li>
                <li>{t("howTo.tab4L3")}</li>
              </ul>
            </Section>

            <Section icon={<Music className="w-5 h-5" />} title={t("howTo.tab5Title")}>
              <p>{t("howTo.tab5P1")}</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                <li>{t("howTo.tab5L1")}</li>
                <li>{t("howTo.tab5L2")}</li>
              </ul>
            </Section>
          </div>

        </div>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default HowTo;