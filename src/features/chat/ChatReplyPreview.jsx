import React from 'react';
import { Box, HStack, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatReplyPreview = ({ target, onCancel, isEditing = false }) => {
  const { t } = useTranslation();
  const previewBg = useColorModeValue('cyan.50', 'whiteAlpha.100');
  const previewTextColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const iconHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  if (!target) return null;
  return (
    <Box borderLeft="3px solid" borderColor="brand.500" bg={previewBg} borderRadius="8px" p={2}>
      <HStack justify="space-between" align="start">
        <Box>
          <Text fontSize="xs" color="brand.300" fontWeight="600">
            {isEditing ? t('chat.editingMessage') : t('chat.replyingTo', { username: target.senderUsername })}
          </Text>
          <Text fontSize="xs" color={previewTextColor} noOfLines={1}>
            {target.content || target.replyToSnapshot?.contentPreview || ''}
          </Text>
        </Box>
        <IconButton size="xs" variant="ghost" color={iconColor} _hover={{ bg: iconHoverBg }} icon={<X size={14} />} onClick={onCancel} aria-label={t('chat.cancel')} />
      </HStack>
    </Box>
  );
};

export default ChatReplyPreview;

