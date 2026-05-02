import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { CheckCircle2 } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = m(Box);

const SupportSuccessScreen = ({ request, onDone, onViewHistory }) => {
  const { t } = useTranslation();
  const msgKey =
    request?.category === 'schedule_meeting'
      ? 'support.successMeeting'
      : request?.category === 'contact_support'
        ? 'support.successContact'
        : 'support.successBug';
  return (
    <VStack spacing={4} py={6}>
      <MotionBox initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <CheckCircle2 size={64} color="#22c55e" />
      </MotionBox>
      <Text fontSize="xl" fontWeight="700">{t('support.successTitle')}</Text>
      <Text>{t('support.referenceIs')}</Text>
      <Box px={3} py={2} borderRadius="md" bg="var(--color-bg-input)" border="1px solid var(--color-border)" color="var(--color-text-heading)" fontFamily="mono">{request?.referenceNumber}</Box>
      <Text textAlign="center" color="var(--color-text-secondary)">{t(msgKey)}</Text>
      <Text color="var(--color-text-muted)">{t('support.emailSentTo', { email: request?.userEmail || '' })}</Text>
      <HStack>
        <Button onClick={onDone} colorScheme="cyan">{t('support.done')}</Button>
        <Button variant="ghost" onClick={onViewHistory}>{t('support.viewMyRequests')}</Button>
      </HStack>
    </VStack>
  );
};

export default SupportSuccessScreen;

