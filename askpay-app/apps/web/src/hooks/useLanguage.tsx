"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/translations";

type Locale = "en" | "sw";

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale = "en" }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("askpay_locale") as Locale;
      if (savedLocale === "en" || savedLocale === "sw") {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
      } else {
        // Fallback to client-side navigator check if no saved locale
        const browserLocale = (navigator.languages && navigator.languages[0]) || navigator.language || "";
        if (browserLocale.toLowerCase().startsWith("sw")) {
          setLocaleState("sw");
          document.documentElement.lang = "sw";
        } else {
          setLocaleState(initialLocale);
          document.documentElement.lang = initialLocale;
        }
      }
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("askpay_locale", newLocale);
      // Also update the html lang attribute for accessibility dynamically
      document.documentElement.lang = newLocale;
    }
  };

  /**
   * Helper translation function. Replaces keys with locale strings and interpolates {variables}.
   */
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const localeDict = translations[locale];
    if (!localeDict) return key;

    let translation = localeDict[key];
    if (translation === undefined) {
      // Fallback to English dictionary if key is missing in chosen locale
      translation = translations["en"]?.[key] ?? key;
    }

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, String(v));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
