import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, TranslationKey } from "../i18n/translations";

type Language = "id" | "en";
type AdminTheme = "dark" | "light";
export type DisplayTheme = "classic" | "neon" | "glassphormism";

interface SettingsContextType {
  language: Language;
  adminTheme: AdminTheme;
  displayTheme: DisplayTheme;
  setLanguage: (lang: Language) => void;
  setAdminTheme: (theme: AdminTheme) => void;
  setDisplayTheme: (theme: DisplayTheme) => void;
  t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("app_language") as Language) || "en"; // default English per new policy
  });

  const [adminTheme, setAdminThemeState] = useState<AdminTheme>(() => {
    return (localStorage.getItem("admin_theme") as AdminTheme) || "dark";
  });

  const [displayTheme, setDisplayThemeState] = useState<DisplayTheme>(() => {
    return (localStorage.getItem("display_theme") as DisplayTheme) || "classic";
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (adminTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [adminTheme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const setAdminTheme = (theme: AdminTheme) => {
    setAdminThemeState(theme);
    localStorage.setItem("admin_theme", theme);
  };

  const setDisplayTheme = (theme: DisplayTheme) => {
    setDisplayThemeState(theme);
    localStorage.setItem("display_theme", theme);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        adminTheme,
        displayTheme,
        setLanguage,
        setAdminTheme,
        setDisplayTheme,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
