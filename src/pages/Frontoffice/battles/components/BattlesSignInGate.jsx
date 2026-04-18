import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const BattlesSignInGate = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      minH="calc(100vh - 4rem)"
      px={{ base: 3, sm: 4, md: 6 }}
      pt={{ base: 20, md: 24 }}
      pb={{ base: 6, md: 10 }}
      bg="var(--color-bg-primary)"
      bgImage="radial-gradient(circle at 12% 18%, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 22%), radial-gradient(circle at 78% 82%, rgba(14, 165, 233, 0.18), transparent 26%), linear-gradient(180deg, rgba(2, 6, 23, 0.02), rgba(2, 6, 23, 0.12))"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(135deg, rgba(2, 6, 23, 0.14), transparent 50%, rgba(2, 6, 23, 0.2))"
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
          borderRadius={{ base: '20px', md: '28px' }}
          border="1px solid var(--color-border)"
          bg="rgba(15, 23, 42, 0.68)"
          backdropFilter="blur(18px)"
          boxShadow="0 30px 70px rgba(2, 6, 23, 0.4)"
          animation="fadeIn 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap="12px" flexWrap="wrap">
            <Box
              w={{ base: '48px', md: '58px' }}
              h={{ base: '48px', md: '58px' }}
              borderRadius="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.16))"
              border="1px solid rgba(34, 211, 238, 0.25)"
              color="cyan.200"
            >
              <LockIcon boxSize={7} />
            </Box>
            <Box>
              <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="cyan.200" fontWeight="700">
                {t('appGuards.battles.badge')}
              </Text>
              <Text color="var(--color-text-secondary)" fontSize="sm">
                {t('appGuards.battles.badgeSub')}
              </Text>
            </Box>
          </Box>

          <Box>
            <Text
              fontFamily="heading"
              fontSize={{ base: '2xl', sm: '3xl', md: '5xl' }}
              lineHeight="1.02"
              fontWeight="800"
              color="var(--color-text-heading)"
              maxW="12ch"
            >
              {t('appGuards.battles.headline')}
            </Text>
            <Text mt={4} color="var(--color-text-secondary)" fontSize={{ base: 'md', md: 'lg' }} maxW="xl">
              {t('appGuards.battles.body')}
            </Text>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={3}
          >
            {[
              { label: t('appGuards.battles.statLive'), value: t('appGuards.battles.statLiveVal') },
              { label: t('appGuards.battles.statRanked'), value: t('appGuards.battles.statRankedVal') },
              { label: t('appGuards.battles.statXp'), value: t('appGuards.battles.statXpVal') },
            ].map((item) => (
              <Box
                key={item.label}
                p={4}
                borderRadius="20px"
                border="1px solid rgba(148, 163, 184, 0.16)"
                bg="rgba(15, 23, 42, 0.52)"
              >
                <Text color="cyan.200" fontWeight="800" fontSize="2xl" lineHeight="1">
                  {item.value}
                </Text>
                <Text mt={1} color="var(--color-text-secondary)" fontSize="sm">
                  {item.label}
                </Text>
              </Box>
            ))}
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={3}
          >
            {[
              t('appGuards.battles.bullet1'),
              t('appGuards.battles.bullet2'),
              t('appGuards.battles.bullet3'),
            ].map((item) => (
              <Box
                key={item}
                p={3.5}
                borderRadius="16px"
                bg="rgba(34, 211, 238, 0.07)"
                border="1px solid rgba(34, 211, 238, 0.18)"
                color="var(--color-text-secondary)"
                fontSize="sm"
              >
                {item}
              </Box>
            ))}
          </Box>

          <VStack spacing={3} align="stretch">
            <Button
              w="100%"
              colorScheme="cyan"
              size="lg"
              onClick={() => navigate('/signin', { state: { from: location } })}
              boxShadow="0 14px 30px rgba(34, 211, 238, 0.22)"
              _hover={{ transform: 'translateY(-1px)', boxShadow: '0 18px 34px rgba(34, 211, 238, 0.26)' }}
              transition="all 0.2s ease"
            >
              {t('header.login')}
            </Button>
            <Button
              w="100%"
              variant="outline"
              size="lg"
              onClick={() => navigate('/signup')}
              borderColor="rgba(34, 211, 238, 0.28)"
              _hover={{ bg: 'rgba(34, 211, 238, 0.08)', transform: 'translateY(-1px)' }}
              transition="all 0.2s ease"
            >
              {t('header.createAccount')}
            </Button>
          </VStack>
        </VStack>

        <Box
          p={{ base: 4, sm: 5, md: 6 }}
          borderRadius={{ base: '20px', md: '28px' }}
          border="1px solid rgba(148, 163, 184, 0.18)"
          bg="rgba(2, 6, 23, 0.45)"
          boxShadow="0 24px 60px rgba(2, 6, 23, 0.3)"
          backdropFilter="blur(16px)"
        >
          <Box
            mb={4}
            p={4}
            borderRadius="22px"
            bg="linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(15, 23, 42, 0.72))"
            border="1px solid rgba(34, 211, 238, 0.2)"
          >
            <Text fontSize="sm" color="cyan.200" fontWeight="700" letterSpacing="0.14em" textTransform="uppercase">
              {t('appGuards.battles.previewLabel')}
            </Text>
            <Text mt={2} fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="white">
              {t('appGuards.battles.previewTitle')}
            </Text>
            <Text mt={2} color="rgba(226, 232, 240, 0.82)">
              {t('appGuards.battles.previewBody')}
            </Text>
          </Box>

          <Box display="grid" gridTemplateColumns="1fr" gap={3}>
            {[
              { title: t('appGuards.battles.card1Title'), detail: t('appGuards.battles.card1Detail'), tone: 'rgba(59, 130, 246, 0.14)' },
              { title: t('appGuards.battles.card2Title'), detail: t('appGuards.battles.card2Detail'), tone: 'rgba(14, 165, 233, 0.14)' },
              { title: t('appGuards.battles.card3Title'), detail: t('appGuards.battles.card3Detail'), tone: 'rgba(34, 211, 238, 0.14)' },
            ].map((card) => (
              <Box
                key={card.title}
                p={4}
                borderRadius="20px"
                bg={card.tone}
                border="1px solid rgba(148, 163, 184, 0.16)"
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                  <Text color="white" fontWeight="700">
                    {card.title}
                  </Text>
                  <Box w="10px" h="10px" borderRadius="999px" bg="cyan.300" />
                </Box>
                <Text mt={1.5} color="rgba(226, 232, 240, 0.82)" fontSize="sm">
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
