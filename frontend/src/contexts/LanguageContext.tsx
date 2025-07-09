import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: 'si' | 'en';
  setLanguage: (lang: 'si' | 'en') => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<'si' | 'en'>('si');

  useEffect(() => {
    // Get language from localStorage or default to Sinhala
    const savedLanguage = localStorage.getItem('language') as 'si' | 'en' || 'si';
    setLanguageState(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const setLanguage = (lang: 'si' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    
    // Update document direction for RTL support if needed
    document.documentElement.dir = lang === 'si' ? 'ltr' : 'ltr';
    document.documentElement.lang = lang === 'si' ? 'si' : 'en';
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
