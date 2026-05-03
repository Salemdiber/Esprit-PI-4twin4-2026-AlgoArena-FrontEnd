import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../pages/Frontoffice/auth/context/AuthContext';
import { useChatSocket } from './useChatSocket';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isLoggedIn, currentUser } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [bootSocket, setBootSocket] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setBootSocket(false);
      return undefined;
    }

    let cancelled = false;
    const start = () => {
      if (!cancelled) setBootSocket(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 3000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timeoutId = window.setTimeout(start, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isLoggedIn]);

  const socketState = useChatSocket({ isAuthenticated: isLoggedIn && bootSocket, currentUser });

  React.useEffect(() => {
    if (!socketState.messages.length) return;
    if (!isChatOpen) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [isChatOpen, socketState.messages.length]);

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) setUnreadCount(0);
  };
  const minimizePanel = () => setIsPanelMinimized((prev) => !prev);

  const value = useMemo(
    () => ({
      ...socketState,
      isChatOpen,
      isPanelMinimized,
      unreadCount,
      isAuthenticated: isLoggedIn,
      currentUser,
      replyTarget,
      editingMessage,
      setReplyTarget,
      setEditingMessage,
      openChat,
      closeChat,
      toggleChat,
      minimizePanel,
    }),
    [
      currentUser,
      editingMessage,
      isChatOpen,
      isLoggedIn,
      isPanelMinimized,
      replyTarget,
      socketState,
      unreadCount,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
};

