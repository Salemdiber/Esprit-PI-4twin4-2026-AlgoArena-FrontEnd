import React from 'react';
import { Box, Button, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const BattlesSignInGate = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useColorModeValue('light', 'dark');
  const accentColor = useColorModeValue('cyan.600', 'cyan.200');
  const cardBg = useColorModeValue('white', 'var(--color-bg-card)');
  const mutedText = useColorModeValue('gray.600', 'var(--color-text-secondary)');

  return (
    <Box
      minH="calc(100vh - 4rem)"
      px={{ base: 3, sm: 4, md: 6 }}
      pt={{ base: 20, md: 24 }}
      pb={{ base: 6, md: 10 }}
      bg="var(--color-bg-primary)"
      bgImage={useColorModeValue(
        'radial-gradient(circle at 12% 18%, rgba(34, 211, 238, 0.08), transparent 24%), radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.08), transparent 22%)',
        'radial-gradient(circle at 12% 18%, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 22%), radial-gradient(circle at 78% 82%, rgba(14, 165, 233, 0.18), transparent 26%)'
      )}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        bg={useColorModeValue('transparent', 'linear-gradient(135deg, rgba(2, 6, 23, 0.14), transparent 50%, rgba(2, 6, 23, 0.2))')}
        pointerEvents="none"
      />
      <Box
        position="relative"
        maxW="7xl"
        w="100%"
        mx="auto"
        minH={{ base: 'calc(100vh - 8rem)', md: 'calc(100vh - 10rem)' }}
        display="grid"
        gridTemplateColumns={{ base: '1fr', xl: '1.05fr 0.95fr' }}
        gap={{ base: 4, md: 6 }}
        alignItems="center"
      >
        <VStack
          align="stretch"
          spacing={6}
          p={{ base: 4, sm: 5, md: 8 }}
          borderRadius={{ base: '24px', md: '32px' }}
          border="1px solid var(--color-border)"
          bg={cardBg}
          backdropFilter="blur(18px)"
          boxShadow="var(--shadow-custom)"
          animation="fadeIn 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap="16px" flexWrap="wrap">
            <Box
              w={{ base: '52px', md: '64px' }}
              h={{ base: '52px', md: '64px' }}
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue('cyan.50', 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.16))')}
              border="1px solid"
              borderColor={useColorModeValue('cyan.100', 'rgba(34, 211, 238, 0.25)')}
              color={accentColor}
            >
              <LockIcon boxSize={7} />
            </Box>
            <Box>
              <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color={accentColor} fontWeight="900">
                {t('appGuards.battles.badge')}
              </Text>
              <Text color={mutedText} fontSize="sm" fontWeight="semibold">
                {t('appGuards.battles.badgeSub')}
              </Text>
            </Box>
          </Box>

          <Box>
            <Text
              fontFamily="heading"
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              lineHeight="1.1"
              fontWeight="900"
              color="var(--color-text-heading)"
              letterSpacing="tight"
            >
              {t('appGuards.battles.headline')}
            </Text>
            <Text mt={5} color={mutedText} fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall" maxW="xl">
              {t('appGuards.battles.body')}
            </Text>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={4}
          >
            {[
              { label: t('appGuards.battles.statLive'), value: t('appGuards.battles.statLiveVal') },
              { label: t('appGuards.battles.statRanked'), value: t('appGuards.battles.statRankedVal') },
              { label: t('appGuards.battles.statXp'), value: t('appGuards.battles.statXpVal') },
            ].map((item) => (
              <Box
                key={item.label}
                p={5}
                borderRadius="24px"
                border="1px solid"
                borderColor="var(--color-border)"
                bg="var(--color-bg-secondary)"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', borderColor: accentColor }}
              >
                <Text color={accentColor} fontWeight="900" fontSize="3xl" lineHeight="1" mb={2}>
                  {item.value}
                </Text>
                <Text color={mutedText} fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                  {item.label}
                </Text>
              </Box>
            ))}
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={3}
          >
            {[
              t('appGuards.battles.bullet1'),
              t('appGuards.battles.bullet2'),
              t('appGuards.battles.bullet3'),
            ].map((item) => (
              <Box
                key={item}
                p={4}
                borderRadius="16px"
                bg={useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.07)')}
                border="1px solid"
                borderColor={useColorModeValue('cyan.100', 'rgba(34, 211, 238, 0.18)')}
                color={useColorModeValue('cyan.800', 'var(--color-text-secondary)')}
                fontSize="xs"
                fontWeight="black"
                textAlign="center"
              >
                {item}
              </Box>
            ))}
          </Box>

          <VStack spacing={4} align="stretch" pt={2}>
            <Button
              w="100%"
              colorScheme="cyan"
              size="lg"
              height="60px"
              fontSize="md"
              fontWeight="black"
              onClick={() => navigate('/signin', { state: { from: location } })}
              boxShadow={useColorModeValue('0 10px 20px rgba(0, 184, 212, 0.2)', '0 14px 30px rgba(34, 211, 238, 0.22)')}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'var(--shadow-xl)' }}
              transition="all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            >
              {t('header.login')}
            </Button>
            <Button
              w="100%"
              variant="outline"
              size="lg"
              height="54px"
              fontSize="md"
              fontWeight="bold"
              onClick={() => navigate('/signup')}
              borderColor={useColorModeValue('cyan.500', 'rgba(34, 211, 238, 0.28)')}
              color={useColorModeValue('cyan.600', 'cyan.200')}
              _hover={{ bg: useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.08)'), transform: 'translateY(-2px)' }}
              transition="all 0.2s ease"
            >
              {t('header.createAccount')}
            </Button>
          </VStack>
        </VStack>

        <Box
          p={{ base: 4, sm: 5, md: 8 }}
          borderRadius="32px"
          border="1px solid var(--color-border)"
          bg="var(--color-bg-elevated)"
          boxShadow="var(--shadow-custom)"
          backdropFilter="blur(16px)"
          position="relative"
        >
          <Box
            mb={6}
            p={6}
            borderRadius="24px"
            bg={useColorModeValue('cyan.50', 'linear-gradient(135deg, rgba(34, 211, 238, 0.16), var(--color-bg-secondary))')}
            border="1px solid"
            borderColor={useColorModeValue('cyan.100', 'rgba(34, 211, 238, 0.2)')}
          >
            <Text fontSize="xs" color={accentColor} fontWeight="900" letterSpacing="0.2em" textTransform="uppercase">
              {t('appGuards.battles.previewLabel')}
            </Text>
            <Text mt={3} fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color="var(--color-text-heading)">
              {t('appGuards.battles.previewTitle')}
            </Text>
            <Text mt={2} color={mutedText} fontSize="sm" fontWeight="medium">
              {t('appGuards.battles.previewBody')}
            </Text>
          </Box>

          <Box display="grid" gridTemplateColumns="1fr" gap={4}>
            {[
              { title: t('appGuards.battles.card1Title'), detail: t('appGuards.battles.card1Detail'), tone: useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.14)') },
              { title: t('appGuards.battles.card2Title'), detail: t('appGuards.battles.card2Detail'), tone: useColorModeValue('sky.50', 'rgba(14, 165, 233, 0.14)') },
              { title: t('appGuards.battles.card3Title'), detail: t('appGuards.battles.card3Detail'), tone: useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.14)') },
            ].map((card) => (
              <Box
                key={card.title}
                p={5}
                borderRadius="20px"
                bg={card.tone}
                border="1px solid"
                borderColor="var(--color-border)"
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                  <Text color="var(--color-text-heading)" fontWeight="800" fontSize="sm">
                    {card.title}
                  </Text>
                  <Box w="8px" h="8px" borderRadius="full" bg={accentColor} />
                </Box>
                <Text mt={2} color={mutedText} fontSize="xs" fontWeight="medium">
                  {card.detail}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BattlesSignInGate;
