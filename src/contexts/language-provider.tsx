
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client after hydration
    try {
      const storedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (storedLanguage && VALID_LANGUAGES.includes(storedLanguage)) {
        setLanguage(storedLanguage);
      } else {
        setLanguage('id'); // Default to Indonesian
      }
    } catch (error) {
      console.error("Failed to parse language from localStorage", error);
      setLanguage('id'); // Fallback on error
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    // This effect runs whenever language changes, but not on initial load
    if (!isInitialLoad) {
      try {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
      } catch (error) {
        console.error("Failed to save language to localStorage", error);
      }
    }
  }, [language, isInitialLoad]);

  const value = {
    language,
    setLanguage: (lang: Language) => {
      setLanguage(lang);
    },
  };

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
