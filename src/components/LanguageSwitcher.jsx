import React, { useContext, useState, useRef, useEffect } from 'react';
import { LanguageContext } from '../shared/context/LanguageContext';

/**
 * Language Switcher - Multi-language Translation Component
 * Displays globe icon with language selector dropdown
 */
export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get language context
  const context = useContext(LanguageContext);
  
  const language = context?.language || 'en';
  const changeLanguage = context?.changeLanguage || (() => {});
  const isTranslating = context?.isTranslating || false;

  const LANGUAGES = {
    en: { name: 'English', flag: '🇬🇧' },
    fr: { name: 'Français', flag: '🇫🇷' },
    es: { name: 'Español', flag: '🇪🇸' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    pt: { name: 'Português', flag: '🇵🇹' },
    ar: { name: 'العربية', flag: '🇸🇦' },
    ja: { name: '日本語', flag: '🇯🇵' },
    zh: { name: '中文', flag: '🇨🇳' },
  };

  const currentLang = LANGUAGES[language] || LANGUAGES.en;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectLanguage = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* LANGUAGE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid transparent',
          background: isOpen ? 'var(--color-bg-elevated)' : 'transparent',
          color: 'var(--color-text-secondary)',
          cursor: isTranslating ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          opacity: isTranslating ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isTranslating && !isOpen) {
            e.currentTarget.style.background = 'var(--color-bg-elevated)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
        title="Select Language / Choisir la langue"
      >
        {/* Globe Icon */}
        <span style={{ fontSize: '18px', display: 'flex' }}>
          {isTranslating ? '⟳' : '🌐'}
        </span>

        {/* Current Language Flag (hidden on mobile) */}
        <span style={{ fontSize: '14px', display: window.innerWidth > 768 ? 'inline' : 'none' }}>
          {currentLang.flag}
        </span>

        {/* Language Code */}
        <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {language}
        </span>
      </button>

      {/* LANGUAGE DROPDOWN MENU */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '6px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            minWidth: '200px',
            zIndex: 9999,
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden',
          }}
        >
          {/* Language Options */}
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleSelectLanguage(code)}
              disabled={isTranslating}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                background:
                  code === language
                    ? 'var(--color-bg-elevated)'
                    : 'transparent',
                color: 'var(--color-text-primary)',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: code === language ? '600' : '400',
                transition: 'all 0.15s ease',
                borderLeft: `3px solid ${
                  code === language ? 'var(--color-cyan-500)' : 'transparent'
                }`,
                opacity: isTranslating ? 0.6 : 1,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isTranslating) {
                  e.currentTarget.style.background = 'var(--color-bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  code === language ? 'var(--color-bg-elevated)' : 'transparent';
              }}
            >
              {/* Flag */}
              <span style={{ fontSize: '20px', flex: 'none' }}>{lang.flag}</span>

              {/* Language Name */}
              <span style={{ flex: '1' }}>{lang.name}</span>

              {/* Checkmark for current language */}
              {code === language && (
                <span
                  style={{
                    fontSize: '16px',
                    color: 'var(--color-cyan-400)',
                    fontWeight: 'bold',
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}

          {/* Footer Info */}
          <div
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-primary)',
            }}
          >
            Powered by Google Translate
          </div>
        </div>
      )}
    </div>
  );
}
