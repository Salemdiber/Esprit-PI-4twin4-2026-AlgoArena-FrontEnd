import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const normalizeLng = (lng) => (lng && String(lng).toLowerCase().startsWith('fr') ? 'fr' : 'en');
const detectLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage?.getItem('i18nextLng');
  return normalizeLng(stored || window.navigator?.language || 'en');
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

i18n.on('languageChanged', (lng) => {
  const n = normalizeLng(lng);
  if (n !== lng) i18n.changeLanguage(n);
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem('i18nextLng', n);
  }
});

export function getAcceptLanguageHeader() {
  return normalizeLng(i18n.language);
}

export default i18n;
