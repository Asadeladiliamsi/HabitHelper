'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'ru' | 'zh' | 'hi' | 'ar' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'habithelper-lang';

const VALID_LANGUAGES: Language[] = ['id', 'en', 'es', 'fr', 'de', 'ja', 'pt', 'ru', 'zh', 'hi', 'ar', 'ko'];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('id');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client-side
    setIsMounted(true);
    try {
      const storedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (storedLanguage && VALID_LANGUAGES.includes(storedLanguage)) {
        setLanguage(storedLanguage);
      }
    } catch (error) {
      console.error("Failed to read language from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
      } catch (error) {
        console.error("Failed to save language to localStorage", error);
      }
    }
  }, [language, isMounted]);

  const value = {
    language,
    setLanguage: (lang: Language) => {
      if (VALID_LANGUAGES.includes(lang)) {
        setLanguage(lang);
      }
    },
  };
  
  // To prevent hydration mismatch, we don't render children until the component
  // has mounted and has had a chance to read from localStorage.
  if (!isMounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
