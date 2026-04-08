import React from 'react';
import { Alert, AlertIcon, Box, Button, VStack } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useChat } from './ChatProvider';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatMessageInput from './ChatMessageInput';

const MotionBox = motion(Box);

const ChatPanel = () => {
  const { t } = useTranslation();
  const chat = useChat();
  if (!chat.isAuthenticated) return null;

  return (
    <AnimatePresence>
      {chat.isChatOpen && (
        <MotionBox
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          position="fixed"
          right={{ base: 0, sm: '24px' }}
          bottom={{ base: 0, sm: '24px' }}
          top={{ base: '60px', sm: 'auto' }}
          w={{ base: '100%', sm: '380px' }}
          h={{ base: 'calc(100vh - 60px)', sm: chat.isPanelMinimized ? 'auto' : '520px' }}
          maxH={{ base: 'calc(100vh - 60px)', sm: '520px' }}
          borderRadius={{ base: 0, sm: '16px' }}
          bg="rgba(2,6,23,0.95)"
          boxShadow="0 20px 55px rgba(0,0,0,0.45)"
          overflow="hidden"
          zIndex={70}
          display="flex"
          flexDirection="column"
        >
          <ChatHeader
            onClose={chat.closeChat}
            onMinimize={chat.minimizePanel}
            minimized={chat.isPanelMinimized}
            unreadCount={chat.unreadCount}
            isConnected={chat.isConnected}
          />
          {!chat.isPanelMinimized && (
            <VStack flex={1} minH={0} spacing={0} align="stretch">
              {chat.connectionError && (
                <Alert status="warning" py={1.5}>
                  <AlertIcon />
                  {t('chat.reconnectingWithAttempt', { attempt: chat.reconnectAttempt || 0 })}
                </Alert>
              )}
              <ChatMessageList
                messages={chat.messages}
                typingUsers={chat.typingUsers}
                currentUser={chat.currentUser}
                hasMore={chat.hasMore}
                loadingMore={chat.historyLoading}
                historyError={chat.historyError}
                loadMore={chat.loadMoreHistory}
                onRetry={chat.reloadHistory}
                onReply={chat.setReplyTarget}
                onEdit={chat.setEditingMessage}
                onDelete={(msg) => chat.deleteMessage({ messageId: msg._id })}
                onToggleReaction={(messageId, emoji, active) =>
                  active ? chat.removeReaction({ messageId, emoji }) : chat.addReaction({ messageId, emoji })
                }
              />
              <ChatMessageInput
                isConnected={chat.isConnected}
                replyTarget={chat.replyTarget}
                setReplyTarget={chat.setReplyTarget}
                editingMessage={chat.editingMessage}
                setEditingMessage={chat.setEditingMessage}
                sendTyping={chat.sendTyping}
                sendStopTyping={chat.sendStopTyping}
                onSend={(payload) => {
                  if (payload.edit) return chat.editMessage({ messageId: payload.messageId, content: payload.content });
                  return chat.sendMessage({ content: payload.content, replyTo: payload.replyTo });
                }}
              />
            </VStack>
          )}
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;

