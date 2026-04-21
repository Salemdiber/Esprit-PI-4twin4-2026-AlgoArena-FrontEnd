import React from 'react';
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatEmptyState = () => {
  const { t } = useTranslation();
  const toneColor = useColorModeValue('gray.500', 'gray.400');
  const bodyColor = useColorModeValue('gray.600', 'gray.400');
  return (
    <VStack py={8} spacing={3} color={toneColor}>
      <Box opacity={0.8}>
        <MessageCircle size={30} />
      </Box>
      <Text fontWeight="600">{t('chat.emptyTitle')}</Text>
      <Text fontSize="sm" color={bodyColor}>{t('chat.emptyBody')}</Text>
    </VStack>
  );
};

export default ChatEmptyState;

