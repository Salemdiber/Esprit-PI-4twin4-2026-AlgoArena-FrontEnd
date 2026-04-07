import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatEmptyState = () => {
  const { t } = useTranslation();
  return (
    <VStack py={8} spacing={3} color="gray.400">
      <Box opacity={0.8}>
        <MessageCircle size={30} />
      </Box>
      <Text fontWeight="600">{t('chat.emptyTitle')}</Text>
      <Text fontSize="sm">{t('chat.emptyBody')}</Text>
    </VStack>
  );
};

export default ChatEmptyState;

