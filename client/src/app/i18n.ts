import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en.json';
import hiTranslation from '../locales/hi.json';
import taTranslation from '../locales/ta.json';
import teTranslation from '../locales/te.json';
import mrTranslation from '../locales/mr.json';
import knTranslation from '../locales/kn.json';
import paTranslation from '../locales/pa.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
      ta: { translation: taTranslation },
      te: { translation: teTranslation },
      mr: { translation: mrTranslation },
      kn: { translation: knTranslation },
      pa: { translation: paTranslation },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ta', 'te', 'mr', 'kn', 'pa'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

void i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

export default i18n;
