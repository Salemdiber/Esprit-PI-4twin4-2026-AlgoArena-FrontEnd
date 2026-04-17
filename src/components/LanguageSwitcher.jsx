import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
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

/** Flag-based compact language switcher with premium styling */
export default function LanguageSwitcher({ size = 'sm', compact = false }) {
  const { t } = useTranslation();
  const lang = (i18n.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';

  const activeBg = useColorModeValue(
    'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(59,130,246,0.08))',
    'linear-gradient(135deg, rgba(34,211,238,0.16), rgba(139,92,246,0.1))'
  );
  const inactiveBg = 'transparent';
  const activeBorder = useColorModeValue('rgba(34,211,238,0.4)', 'rgba(34,211,238,0.35)');
  const inactiveBorder = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)');
  const hoverBg = useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.06)');
  const activeShadow = '0 0 12px rgba(34,211,238,0.2)';
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const activeTextColor = useColorModeValue('cyan.700', 'cyan.200');

  const options = [
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
  ];

  return (
    <HStack
      spacing={1}
      role="group"
      aria-label={t('languageSwitcher.groupAria')}
      p={0.5}
      borderRadius="10px"
      bg={useColorModeValue('rgba(0,0,0,0.03)', 'rgba(255,255,255,0.04)')}
    >
      {options.map((opt) => {
        const isActive = lang === opt.code;
        return (
          <Box
            as="button"
            key={opt.code}
            onClick={() => setLang(opt.code)}
            aria-pressed={isActive}
            aria-label={t(`languageSwitcher.${opt.code === 'en' ? 'english' : 'french'}`)}
            display="flex"
            alignItems="center"
            gap={1.5}
            px={compact ? 2 : 2.5}
            py={1}
            borderRadius="8px"
            border="1px solid"
            borderColor={isActive ? activeBorder : inactiveBorder}
            bg={isActive ? activeBg : inactiveBg}
            boxShadow={isActive ? activeShadow : 'none'}
            cursor="pointer"
            transition="all 0.25s ease"
            _hover={{
              bg: isActive ? activeBg : hoverBg,
              transform: 'translateY(-1px)',
              boxShadow: isActive ? activeShadow : '0 2px 8px rgba(0,0,0,0.08)',
            }}
            _active={{ transform: 'scale(0.96)' }}
          >
            <Text fontSize="14px" lineHeight="1" userSelect="none">
              {opt.flag}
            </Text>
            <Text
              fontSize="xs"
              fontWeight={isActive ? 'bold' : 'medium'}
              color={isActive ? activeTextColor : textColor}
              letterSpacing={isActive ? '0.03em' : undefined}
              transition="all 0.2s"
            >
              {opt.label}
            </Text>
          </Box>
        );
      })}
    </HStack>
  );
}

export { setLang };
