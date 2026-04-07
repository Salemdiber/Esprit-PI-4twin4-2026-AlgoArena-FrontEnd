import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Dot = motion.div;

const ChatTypingIndicator = ({ users }) => {
  const { t } = useTranslation();
  const names = Array.from(users || []);
  if (!names.length) return null;

  let label = t('chat.typingSeveral');
  if (names.length === 1) label = t('chat.typingSingle', { user: names[0] });
  if (names.length === 2) label = t('chat.typingTwo', { user1: names[0], user2: names[1] });

  return (
    <HStack px={2} py={1} spacing={2}>
      <Text fontSize="xs" color="gray.400">
        {label}
      </Text>
      <HStack spacing={1}>
        {[0, 1, 2].map((i) => (
          <Dot
            key={i}
            style={{ width: 4, height: 4, borderRadius: 9999, background: '#94a3b8' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
          />
        ))}
      </HStack>
    </HStack>
  );
};

export default ChatTypingIndicator;

