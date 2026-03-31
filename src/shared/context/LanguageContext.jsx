import React, { createContext, useCallback, useState, useEffect } from 'react';
import { translations, t } from './translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize with saved language or default to 'fr'
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('selectedLanguage');
    if (saved && ['en', 'fr', 'es', 'de', 'it', 'pt', 'ar', 'ja', 'zh'].includes(saved)) {
      return saved;
    }
    return 'fr'; // Default to French
  };

  const [language, setLanguage] = useState(getInitialLanguage());
  const [isTranslating, setIsTranslating] = useState(false);

  // Supported languages
  const LANGUAGES = {
    en: { name: 'English', flag: '🇬🇧', code: 'en' },
    fr: { name: 'Français', flag: '🇫🇷', code: 'fr' },
    es: { name: 'Español', flag: '🇪🇸', code: 'es' },
    de: { name: 'Deutsch', flag: '🇩🇪', code: 'de' },
    it: { name: 'Italiano', flag: '🇮🇹', code: 'it' },
    pt: { name: 'Português', flag: '🇵🇹', code: 'pt' },
    ar: { name: 'العربية', flag: '🇸🇦', code: 'ar' },
    ja: { name: '日本語', flag: '🇯🇵', code: 'ja' },
    zh: { name: '中文', flag: '🇨🇳', code: 'zh' },
  };

  // 1. Define the initialization function globally
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: Object.values(LANGUAGES).map(l => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  // 2. Trigger translation on mount if language is not English
  useEffect(() => {
    if (language !== 'en') {
      // Small delay to ensure script has a chance to initialize
      const timer = setTimeout(() => {
        changeLanguage(language, true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // helper to load Google script
  const loadGoogleTranslate = useCallback(() => {
    return new Promise((resolve) => {
      if (window.google?.translate) {
        resolve();
        return;
      }

      if (document.getElementById('google-translate-script')) {
        // Script already exists, wait for it
        let checkInterval = setInterval(() => {
          if (window.google?.translate) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => resolve(); // continue anyway
      document.head.appendChild(script);
    });
  }, []);

  // Translate page using Google Translate API
  const changeLanguage = useCallback(
    async (targetLanguage, force = false) => {
      if (!force && targetLanguage === language) return;

      try {
        setIsTranslating(true);
        console.log(`🌐 Switching to ${targetLanguage}...`);

        // Save selection
        localStorage.setItem('selectedLanguage', targetLanguage);
        setLanguage(targetLanguage);

        // Ensure script is loaded
        await loadGoogleTranslate();

        // Give Google a moment to initialize the DOM element
        let retryCount = 0;
        const triggerTranslation = () => {
          const selectElement = document.querySelector('.goog-te-combo');
          if (selectElement) {
            selectElement.value = targetLanguage;
            selectElement.dispatchEvent(new Event('change'));
            console.log(`✅ Google Translate triggered for ${targetLanguage}`);
            setIsTranslating(false);
          } else if (retryCount < 30) {
            retryCount++;
            setTimeout(triggerTranslation, 300);
          } else {
            console.warn('⚠️ Google Translate select element not found after retries');
            setIsTranslating(false);
          }
        };

        triggerTranslation();
      } catch (err) {
        console.error('❌ Language change failed:', err);
        setIsTranslating(false);
      }
    },
    [language, loadGoogleTranslate]
  );

  // Helper function for local translations
  const translate = useCallback((key) => {
    return t(key, language);
  }, [language]);

  const value = {
    language,
    isTranslating,
    LANGUAGES,
    changeLanguage,
    translate,
    translations: translations[language] || translations.en,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {/* Container for the hidden Google Translate widget */}
      <div id="google_translate_element" style={{ visibility: 'hidden', position: 'absolute', top: '-9999px' }} />
      <style>
        {`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0 !important; }
          .goog-te-balloon-frame { display: none !important; }
          .goog-text-highlight { background: none !important; box-shadow: none !important; }
        `}
      </style>
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
