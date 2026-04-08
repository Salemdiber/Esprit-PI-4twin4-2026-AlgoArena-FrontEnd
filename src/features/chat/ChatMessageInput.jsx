import React, { useEffect, useRef, useState } from 'react';
import { Box, HStack, IconButton, Text, Textarea, useToast, VStack } from '@chakra-ui/react';
import { Check, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatReplyPreview from './ChatReplyPreview';
import { TYPING_DEBOUNCE_MS } from './chatConstants';

const ChatMessageInput = ({
  isConnected,
  onSend,
  sendTyping,
  sendStopTyping,
  replyTarget,
  setReplyTarget,
  editingMessage,
  setEditingMessage,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [value, setValue] = useState('');
  const [inlineError, setInlineError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (editingMessage) setValue(editingMessage.content || '');
  }, [editingMessage]);

  const submit = () => {
    const content = value.trim();
    if (!content) return;
    if (!isConnected) {
      setInlineError(t('chat.notConnectedSend'));
      return;
    }
    const ok = editingMessage
      ? onSend({ edit: true, messageId: editingMessage._id, content })
      : onSend({ content, replyTo: replyTarget?._id });
    if (ok === false) {
      setInlineError(t('chat.sendFailed'));
      return;
    }
    setInlineError(null);
    setValue('');
    setReplyTarget(null);
    setEditingMessage(null);
  };

  return (
    <VStack
      spacing={2}
      align="stretch"
      p={2}
      pb={{ base: 'calc(8px + env(safe-area-inset-bottom))', sm: 2 }}
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
      bg="rgba(2,6,23,0.96)"
    >
      {replyTarget && <ChatReplyPreview target={replyTarget} onCancel={() => setReplyTarget(null)} />}
      {editingMessage && <ChatReplyPreview target={editingMessage} onCancel={() => setEditingMessage(null)} isEditing />}
      <HStack align="end">
        <Box flex={1}>
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              sendTyping();
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => sendStopTyping(), TYPING_DEBOUNCE_MS);
            }}
            placeholder={t('chat.placeholder')}
            minH="40px"
            maxH="120px"
            resize="none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          {inlineError && (
            <Text mt={1} fontSize="xs" color="red.300">
              {inlineError}
            </Text>
          )}
        </Box>
        <IconButton
          aria-label={editingMessage ? t('chat.saveEdit') : t('chat.send')}
          icon={editingMessage ? <Check size={16} /> : <Send size={16} />}
          onClick={submit}
          isDisabled={!value.trim()}
          colorScheme="cyan"
        />
      </HStack>
    </VStack>
  );
};

export default ChatMessageInput;

