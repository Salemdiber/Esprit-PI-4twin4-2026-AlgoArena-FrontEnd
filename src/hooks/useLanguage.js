import { useContext } from 'react';
import { LanguageContext } from '../shared/context/LanguageContext';

/**
 * Custom hook for accessing language context and translation functions
 * Usage: const { translate, language, changeLanguage } = useLanguage();
 */
export function useLanguage() {
  const context = useContext(LanguageContext);

  // Fallback function when context is not available
  const fallbackT = (key, replacements = {}) => {
    let text = key;
    Object.entries(replacements).forEach(([k, value]) => {
      text = text.replace(`{${k}}`, value);
    });
    return text;
  };

  if (!context) {
    console.warn('⚠️ useLanguage must be used within LanguageProvider');
    return {
      translate: (key) => key,
      t: fallbackT,
      language: 'en',
      changeLanguage: () => {},
      isTranslating: false,
      translations: {},
    };
  }

  // Destructure context and provide helper function
  const { translate, language, changeLanguage, isTranslating, translations } = context;

  /**
   * Helper function to translate a key and format placeholders
   * Usage: t('arena.title') or t('error.message', { count: 5 })
   */
  const t = (key, replacements = {}) => {
    let translatedText = translate(key);

    // Replace placeholders like {count}, {username}, etc.
    Object.entries(replacements).forEach(([k, value]) => {
      translatedText = translatedText.replace(`{${k}}`, value);
    });

    return translatedText;
  };

  return {
    translate,
    t, // Enhanced translation function with placeholder support
    language,
    changeLanguage,
    isTranslating,
    translations,
  };
}

export default useLanguage;
