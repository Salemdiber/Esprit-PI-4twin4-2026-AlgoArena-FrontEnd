import React from 'react';
import { Badge, Box, HStack, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronDown, MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatHeader = ({ onClose, onMinimize, minimized, unreadCount, isConnected }) => {
  const { t } = useTranslation();
  const headerBg = useColorModeValue('var(--color-bg-secondary)', 'rgba(15,23,42,0.92)');
  const borderColor = useColorModeValue('var(--color-border)', 'whiteAlpha.200');
  const iconColor = useColorModeValue('gray.700', 'gray.200');
  const iconHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  return (
    <Box bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
      <Box h="2px" bgGradient="linear(to-r, brand.400, cyan.300)" />
      <HStack px={3} py={2.5} justify="space-between">
        <HStack>
          <MessageCircle size={16} />
          <Text fontWeight="700" fontSize="sm">
            {t('chat.title')}
          </Text>
          <Badge colorScheme={isConnected ? 'green' : 'orange'}>{isConnected ? t('chat.live') : t('chat.reconnecting')}</Badge>
        </HStack>
        <HStack>
          {unreadCount > 0 && <Badge colorScheme="cyan">{unreadCount > 10 ? '10+' : unreadCount}</Badge>}
          <IconButton size="xs" variant="ghost" color={iconColor} _hover={{ bg: iconHoverBg }} icon={<ChevronDown size={14} />} onClick={onMinimize} aria-label={minimized ? t('chat.expand') : t('chat.minimize')} />
          <IconButton size="xs" variant="ghost" color={iconColor} _hover={{ bg: iconHoverBg }} icon={<X size={14} />} onClick={onClose} aria-label={t('chat.close')} />
        </HStack>
      </HStack>
    </Box>
  );
};

export default ChatHeader;

