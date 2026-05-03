import React, { memo, useMemo, useState } from 'react';
import { Avatar, Badge, Box, HStack, IconButton, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Pencil, Reply, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MAX_MESSAGE_PREVIEW } from './chatConstants';
import ChatReactionPicker from './ChatReactionPicker';

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatMessage = memo(
  ({ message, isMine, onReply, onEdit, onDelete, onToggleReaction, currentUserId, onJumpToMessage, grouped }) => {
    const { t } = useTranslation();
    const deletedColor = useColorModeValue('gray.600', 'gray.500');
    const timeColor = useColorModeValue('gray.500', 'gray.500');
    const replyBg = useColorModeValue('cyan.50', 'whiteAlpha.100');
    const replyPreviewColor = useColorModeValue('gray.600', 'gray.400');
    const messageColor = useColorModeValue('gray.800', 'gray.100');
    const editedColor = useColorModeValue('gray.500', 'gray.500');
    const hoverIconColor = useColorModeValue('gray.700', 'gray.300');
    const hoverIconBg = useColorModeValue('gray.100', 'whiteAlpha.200');
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState(false);

    const showToggle = (message.content || '').length > MAX_MESSAGE_PREVIEW;
    const previewContent = useMemo(() => {
      if (expanded || !showToggle) return message.content;
      return `${message.content.slice(0, MAX_MESSAGE_PREVIEW)}...`;
    }, [expanded, message.content, showToggle]);

    if (message.isDeleted) {
      return (
        <Box px={2} py={1}>
          <Text fontStyle="italic" color={deletedColor} fontSize="sm">
            {t('chat.messageDeleted')}
          </Text>
        </Box>
      );
    }

    return (
      <HStack align="start" spacing={2} px={2} py={grouped ? 1 : 2} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {!grouped ? <Avatar size="xs" name={message.senderUsername} src={message.senderAvatar || undefined} /> : <Box w="24px" />}
        <VStack align="start" spacing={1} flex={1}>
          {!grouped && (
            <HStack spacing={2}>
              <Text fontSize="xs" color="brand.300" fontWeight="700">
                {message.senderUsername}
              </Text>
              <Text fontSize="xs" color={timeColor}>
                {formatTime(message.createdAt)}
              </Text>
            </HStack>
          )}

          {message.replyToSnapshot && (
            <Box
              w="full"
              borderLeft="2px solid"
              borderColor="brand.500"
              bg={replyBg}
              borderRadius="6px"
              px={2}
              py={1}
              cursor="pointer"
              onClick={() => onJumpToMessage(String(message.replyTo))}
            >
              <Text fontSize="xs" color="brand.300">
                {message.replyToSnapshot.senderUsername}
              </Text>
              <Text fontSize="xs" color={replyPreviewColor} noOfLines={1}>
                {message.replyToSnapshot.contentPreview}
              </Text>
            </Box>
          )}

          <Text fontSize="sm" color={messageColor} whiteSpace="pre-wrap" wordBreak="break-word">
            {previewContent}{' '}
            {message.editedAt && (
              <Text as="span" color={editedColor} fontSize="xs">
                ({t('chat.edited')})
              </Text>
            )}
          </Text>
          {showToggle && (
            <Text as="button" fontSize="xs" color="brand.300" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t('chat.showLess') : t('chat.showMore')}
            </Text>
          )}

          <HStack spacing={1}>
            {(message.reactions || []).map((r) => {
              const active = (r.userIds || []).some((id) => String(id) === String(currentUserId));
              return (
                <Badge
                  key={r.emoji}
                  onClick={() => onToggleReaction(message._id, r.emoji, active)}
                  cursor="pointer"
                  variant="subtle"
                  borderWidth="1px"
                  borderColor={active ? 'brand.500' : 'transparent'}
                >
                  {r.emoji} {r.count}
                </Badge>
              );
            })}
          </HStack>
        </VStack>

        {hovered && (
          <HStack spacing={1}>
            <ChatReactionPicker ariaLabel={t('chat.addReaction')} onPick={(emoji) => onToggleReaction(message._id, emoji, false)} />
            <IconButton size="xs" variant="ghost" color={hoverIconColor} _hover={{ bg: hoverIconBg }} icon={<Reply size={14} />} aria-label={t('chat.reply')} onClick={() => onReply(message)} />
            {isMine && (
              <>
                <IconButton size="xs" variant="ghost" color={hoverIconColor} _hover={{ bg: hoverIconBg }} icon={<Pencil size={14} />} aria-label={t('chat.edit')} onClick={() => onEdit(message)} />
                <IconButton size="xs" variant="ghost" color={hoverIconColor} _hover={{ bg: hoverIconBg }} icon={<Trash2 size={14} />} aria-label={t('chat.delete')} onClick={() => onDelete(message)} />
              </>
            )}
          </HStack>
        )}
      </HStack>
    );
  },
);

export default ChatMessage;

