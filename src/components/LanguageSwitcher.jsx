import { Button, ButtonGroup, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

function setLang(code) {
  const c = code === 'fr' ? 'fr' : 'en';
  i18n.changeLanguage(c);
  try {
    localStorage.setItem('i18nextLng', c);
  } catch {
    /* ignore */
  }
}

/** @param {{ size?: string; variant?: string; compact?: boolean }} props */
export default function LanguageSwitcher({ size = 'sm', variant = 'ghost', compact = false }) {
  const { t } = useTranslation();
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const lang = (i18n.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  return (
    <ButtonGroup
      size={size}
      variant={variant}
      isAttached
      spacing={0}
      role="group"
      aria-label={t('languageSwitcher.groupAria')}
    >
      <Button
        onClick={() => setLang('en')}
        fontWeight={lang === 'en' ? 'bold' : 'normal'}
        bg={lang === 'en' ? activeBg : undefined}
        borderColor="var(--color-border)"
        aria-pressed={lang === 'en'}
        aria-label={t('languageSwitcher.english')}
      >
        {compact ? 'EN' : t('languageSwitcher.en')}
      </Button>
      <Button
        onClick={() => setLang('fr')}
        fontWeight={lang === 'fr' ? 'bold' : 'normal'}
        bg={lang === 'fr' ? activeBg : undefined}
        borderColor="var(--color-border)"
        aria-pressed={lang === 'fr'}
        aria-label={t('languageSwitcher.french')}
      >
        {compact ? 'FR' : t('languageSwitcher.fr')}
      </Button>
    </ButtonGroup>
  );
}

export { setLang };
