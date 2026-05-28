import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Rocket, Zap, UserCircle, Mail, Globe, Phone, Music } from "lucide-react";
import { useAppSettings } from "@/contexts/SettingsContext";

const Section = ({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) => (
  <div
    className="bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-up"
    style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
  >
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
    <h2 className="flex items-center gap-3 text-base font-black text-white uppercase tracking-wider mb-3">
      <span className="p-2 rounded-xl bg-white/10 text-yellow-300 shrink-0">{icon}</span>
      {title}
    </h2>
    <div className="text-white/70 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const AboutUs = () => {
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
              {t("aboutUs.title")}
            </h1>
            <p className="text-xs text-white/50 mt-0.5 font-semibold">
              {t("aboutUs.subtitle")}
            </p>
          </div>
          <div className="w-20" />
        </div>

        {/* Hero Banner */}
        <div className="animate-fade-up bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 text-center relative overflow-hidden" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
          <div className="text-6xl mb-3">🎮</div>
          <h2 className="text-2xl md:text-3xl font-black text-yellow-300 uppercase tracking-widest drop-shadow mb-3">Family Fun Time</h2>
        </div>

        {/* 1. Tentang Project */}
        <Section icon={<Gamepad2 className="w-5 h-5" />} title={t("aboutUs.aboutTitle")} delay={0.1}>
          <p>{t("aboutUs.about1")}</p>
          <p>{t("aboutUs.about2")}</p>
        </Section>

        {/* 3. Fitur Utama */}
        <Section icon={<Zap className="w-5 h-5" />} title={t("aboutUs.featuresTitle")} delay={0.2}>
          <ul className="list-disc list-inside space-y-1.5 mt-2">
            <li><strong className="text-white">{t("aboutUs.feat1Title")}</strong> {t("aboutUs.feat1Desc")}</li>
            <li><strong className="text-white">{t("aboutUs.feat2Title")}</strong> {t("aboutUs.feat2Desc")}</li>
            <li><strong className="text-white">{t("aboutUs.feat3Title")}</strong> {t("aboutUs.feat3Desc")}</li>
            <li><strong className="text-white">{t("aboutUs.feat4Title")}</strong> {t("aboutUs.feat4Desc")}</li>
            <li><strong className="text-white">{t("aboutUs.feat5Title")}</strong> {t("aboutUs.feat5Desc")}</li>
          </ul>
        </Section>

        {/* 4. Developer */}
        <Section icon={<UserCircle className="w-5 h-5" />} title={t("aboutUs.devTitle")} delay={0.25}>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-2">
            <div className="flex-1 text-center md:text-left">
              <p className="font-black text-white text-lg tracking-wider uppercase">Haidar Zyan</p>
            </div>
            <a
              href="https://portofolio-haidarzyan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600/50 hover:bg-blue-600 border border-blue-500/50 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              {t("aboutUs.devVisit")}
            </a>
          </div>
        </Section>

        {/* 5. Credits & Attributions */}
        <Section icon={<Music className="w-5 h-5" />} title={t("aboutUs.creditsTitle")} delay={0.28}>
          <p className="font-bold text-white/90 mb-1">{t("aboutUs.creditSoundtrack")}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("aboutUs.creditSoundtrack1")}</li>
            <li>{t("aboutUs.creditSoundtrack2")}</li>
          </ul>
        </Section>

        {/* 5. Kontak */}
        <Section icon={<Mail className="w-5 h-5" />} title={t("aboutUs.contactTitle")} delay={0.3}>
          <ul className="space-y-3 mt-2">
            <li>
              <a href="mailto:contact.haidarzyan@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-white/70 group-hover:text-blue-400" />
                </div>
                <span>familyfuntimeQ@gmail.com</span>
              </a>
            </li>
            {/* <li>
              <a href="https://wa.me/6285862387683" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-white/70 group-hover:text-green-400" />
                </div>
                <span>+62 858-6238-7683</span>
              </a>
            </li> */}
          </ul>
        </Section>

        <ul className="animate-fade-up" style={{ animationDelay: '0.22s', animationFillMode: 'both' }}>
          <li className="list-none rounded-2xl border border-yellow-400/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-5 text-center relative overflow-hidden backdrop-blur-xl">

            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-2xl bg-white/10 text-yellow-300">
                <Rocket className="w-5 h-5" />
              </div>
            </div>

            <p className="text-white/80 text-sm md:text-base leading-relaxed italic">
              {t("aboutUs.quote")}
            </p>
          </li>
        </ul>


        <div className="h-6" />
      </div>

      {/* 6. Footer Singkat */}
      <footer className="relative z-10 w-full py-6 mt-auto border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-semibold text-white/40 tracking-wider">
          <p>COPYRIGHT © {new Date().getFullYear()} FAMILY FUN TIME.</p>
          <p>ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

    </div>
  );
};

export default AboutUs;
