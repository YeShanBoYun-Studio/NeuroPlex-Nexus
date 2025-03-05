import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import type { LocaleKey } from '../types/translations';
import { loadTranslations, tk } from '../utils/i18n';
import { Language as LanguageIcon } from '@mui/icons-material';

interface LanguageInfo {
  code: LocaleKey;
  name: string;
  nativeName: string;
  icon?: React.ReactNode;
}

interface LanguageContextValue {
  language: LocaleKey;
  setLanguage: (locale: LocaleKey) => void;
  availableLanguages: LanguageInfo[];
  t: (key: string) => string;
  tk: typeof tk;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const defaultLanguages: LanguageInfo[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    icon: <LanguageIcon />
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    nativeName: '中文',
    icon: <LanguageIcon />
  },
];

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = React.useState<LocaleKey>(() => {
    const stored = localStorage.getItem('language') as LocaleKey;
    if (stored && defaultLanguages.some(lang => lang.code === stored)) {
      return stored;
    }
    return 'en';
  });

  const [translations, setTranslations] = React.useState<Record<string, string>>({});

  const availableLanguages = useMemo(() => defaultLanguages, []);

  const setLanguage = useCallback((newLanguage: LocaleKey) => {
    if (defaultLanguages.some(lang => lang.code === newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const t = useCallback((key: string): string => {
    const value = translations[key];
    if (!value && import.meta.env.DEV) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return value || key;
  }, [translations]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    availableLanguages,
    t,
    tk,
  }), [language, setLanguage, availableLanguages, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { LanguageInfo };
