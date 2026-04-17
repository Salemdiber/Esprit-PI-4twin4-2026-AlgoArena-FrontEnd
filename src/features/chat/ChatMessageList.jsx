import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ChatMessage from './ChatMessage';
import ChatEmptyState from './ChatEmptyState';
import ChatTypingIndicator from './ChatTypingIndicator';

const sameGroup = (a, b) => {
  if (!a || !b) return false;
  if (String(a.senderId) !== String(b.senderId)) return false;
  const da = new Date(a.createdAt).getTime();
  const db = new Date(b.createdAt).getTime();
  return Math.abs(da - db) <= 2 * 60 * 1000;
};

const dayLabel = (date, t) => {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const key = d.toDateString();
  if (key === now.toDateString()) return t('chat.today');
  if (key === yesterday.toDateString()) return t('chat.yesterday');
  return d.toLocaleDateString();
};

const ChatMessageList = ({
  messages,
  typingUsers,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  loadMore,
  hasMore,
  loadingMore,
  onRetry,
  historyError,
}) => {
  const { t } = useTranslation();
  const listRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (isAtBottom) el.scrollTop = el.scrollHeight;
  }, [messages, isAtBottom]);

  const decorated = useMemo(() => {
    const out = [];
    for (let i = 0; i < messages.length; i += 1) {
      const msg = messages[i];
      const prev = messages[i - 1];
      const showDate = i === 0 || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
      out.push({ msg, grouped: sameGroup(prev, msg), showDate });
    }
    return out;
  }, [messages]);

  return (
    <Box position="relative" flex={1} minH={0} overflow="hidden">
      <Box
        ref={listRef}
        h="100%"
        overflowY="auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          setIsAtBottom(bottom);
          if (el.scrollTop <= 8 && hasMore && !loadingMore) loadMore();
        }}
      >
        {loadingMore && (
          <Center py={2}>
            <Spinner size="xs" />
            <Text fontSize="xs" ml={2}>
              {t('chat.loadingOlder')}
            </Text>
          </Center>
        )}
        {historyError && (
          <Center py={2}>
            <Button size="xs" onClick={onRetry}>
              {t('chat.retry')}
            </Button>
          </Center>
        )}
        {!messages.length ? (
          <ChatEmptyState />
        ) : (
          <VStack align="stretch" spacing={0} py={2}>
            {decorated.map(({ msg, grouped, showDate }) => (
              <Box key={msg._id} id={`chat-msg-${msg._id}`}>
                {showDate && (
                  <Center py={1}>
                    <Text fontSize="xs" color="gray.500">
                      {dayLabel(msg.createdAt, t)}
                    </Text>
                  </Center>
                )}
                <ChatMessage
                  message={msg}
                  grouped={grouped}
                  isMine={String(msg.senderId) === String(currentUser?.userId || currentUser?._id)}
                  currentUserId={currentUser?.userId || currentUser?._id}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleReaction={onToggleReaction}
                  onJumpToMessage={(id) => {
                    const target = document.getElementById(`chat-msg-${id}`);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                />
              </Box>
            ))}
          </VStack>
        )}
      </Box>
      {!isAtBottom && (
        <Button size="xs" position="absolute" right={3} bottom={3} onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })}>
          {t('chat.jumpLatest')}
        </Button>
      )}
      <ChatTypingIndicator users={typingUsers} />
    </Box>
  );
};

export default ChatMessageList;

