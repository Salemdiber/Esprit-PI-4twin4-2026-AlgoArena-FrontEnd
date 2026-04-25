import React from 'react';
import { Alert, AlertIcon, Box, Button, VStack, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useChat } from './ChatProvider';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatMessageInput from './ChatMessageInput';

const MotionBox = m(Box);

const ChatPanel = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const chat = useChat();
  const isDesktop = useBreakpointValue({ base: false, sm: true });
  const panelBg = useColorModeValue('var(--color-bg-card)', 'rgba(2,6,23,0.95)');
  const panelShadow = useColorModeValue('var(--shadow-custom)', '0 20px 55px rgba(0,0,0,0.45)');
  const panelBorder = useColorModeValue('var(--color-border)', 'rgba(255,255,255,0.16)');
  const isCommunityPage = location.pathname.startsWith('/community');
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('chat_panel_drag_offset_v1');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const x = Number(parsed?.x);
      const y = Number(parsed?.y);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        setDragOffset({ x, y });
      }
    } catch {
      // ignore invalid persisted position
    }
  }, []);

  const handleDragEnd = (_event, info) => {
    const next = {
      x: dragOffset.x + info.offset.x,
      y: dragOffset.y + info.offset.y,
    };
    setDragOffset(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chat_panel_drag_offset_v1', JSON.stringify(next));
    }
  };

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
          bottom={{ base: 0, sm: isCommunityPage ? 'auto' : '24px' }}
          top={{ base: '60px', sm: isCommunityPage ? '88px' : 'auto' }}
          w={{ base: '100%', sm: '380px' }}
          h={{ base: 'calc(100vh - 60px)', sm: chat.isPanelMinimized ? 'auto' : (isCommunityPage ? 'calc(100vh - 112px)' : '520px') }}
          maxH={{ base: 'calc(100vh - 60px)', sm: isCommunityPage ? 'calc(100vh - 112px)' : '520px' }}
          borderRadius={{ base: 0, sm: '16px' }}
          bg={panelBg}
          border="1px solid"
          borderColor={panelBorder}
          boxShadow={panelShadow}
          overflow="hidden"
          zIndex={70}
          display="flex"
          flexDirection="column"
          drag={Boolean(isDesktop)}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            x: isDesktop ? dragOffset.x : 0,
            y: isDesktop ? dragOffset.y : 0,
            cursor: isDesktop ? 'grab' : 'default',
          }}
          whileDrag={{ cursor: 'grabbing' }}
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

