import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getToken, setToken } from '../../services/cookieUtils';
import { chatApi } from './chatApi';
import { CHAT_PAGE_SIZE, CHAT_ROOM_ID, MAX_RECONNECT_ATTEMPTS } from './chatConstants';

const toWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs) return envWs;
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.startsWith('http')) {
    return envApi.replace(/^http/i, 'ws').replace(/\/api\/?$/, '') + '/chat/ws';
  }
  return 'ws://localhost:3000/chat/ws';
};

const normalizeIncoming = (payload) => ({
  ...payload,
  _id: String(payload._id),
});

const dedupeById = (items) => {
  const seen = new Set();
  const next = [];
  for (const item of items || []) {
    const normalized = normalizeIncoming(item);
    if (seen.has(normalized._id)) continue;
    seen.add(normalized._id);
    next.push(normalized);
  }
  return next;
};

const replaceMessageById = (messages, messageId, updater) =>
  messages.map((msg) => (String(msg._id) === String(messageId) ? updater(msg) : msg));

const appendUniqueMessage = (messages, message) => {
  const normalized = normalizeIncoming(message);
  if (messages.some((msg) => String(msg._id) === String(normalized._id))) {
    return messages;
  }
  return [...messages, normalized];
};

const parseSocketPacket = (rawData) => {
  try {
    return JSON.parse(rawData);
  } catch {
    return null;
  }
};

const syncRoomJoinedMessages = (data, setMessages, setHasMore, hasMoreRef) => {
  const incoming = dedupeById(data?.messages || []);
  setMessages(incoming);
  hasMoreRef.current = !!data?.hasMore;
  setHasMore(!!data?.hasMore);
};

const handleChatPacket = ({
  event,
  data,
  setMessages,
  setConnectionError,
  scheduleTypingRemoval,
  clearTypingUser,
}) => {
  switch (event) {
    case 'newMessage':
      setMessages((prev) => appendUniqueMessage(prev, data));
      return;
    case 'reactionUpdated':
      setMessages((prev) =>
        replaceMessageById(prev, data.messageId, (msg) => ({ ...msg, reactions: data.reactions || [] })),
      );
      return;
    case 'messageEdited':
      setMessages((prev) =>
        replaceMessageById(prev, data.messageId, (msg) => ({ ...msg, content: data.content, editedAt: data.editedAt })),
      );
      return;
    case 'messageDeleted':
      setMessages((prev) =>
        replaceMessageById(prev, data.messageId, (msg) => ({ ...msg, isDeleted: true, content: '' })),
      );
      return;
    case 'userTyping':
      if (data?.username) {
        scheduleTypingRemoval(data.username);
      }
      return;
    case 'userStoppedTyping':
      if (data?.username) clearTypingUser(data.username);
      return;
    case 'error':
      setConnectionError(data?.message || 'Chat error');
      return;
    default:
      return;
  }
};

const handleSocketClose = async ({
  event,
  isAuthenticated,
  setIsConnected,
  setIsConnecting,
  setConnectionError,
  setReconnectAttempt,
  reconnectAttemptsRef,
  reconnectTimerRef,
  connect,
}) => {
  setIsConnected(false);
  setIsConnecting(false);
  if (!isAuthenticated) return;

  if (event.code === 4001) {
    try {
      const refreshed = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshed.ok) {
        const json = await refreshed.json();
        if (json?.access_token) {
          setToken(json.access_token);
        }
      }
    } catch {
      // best effort
    }
  }

  if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
    setConnectionError('Reconnection attempts exhausted');
    return;
  }

  reconnectAttemptsRef.current += 1;
  const delay = Math.min(30000, 1000 * 2 ** (reconnectAttemptsRef.current - 1));
  setReconnectAttempt(reconnectAttemptsRef.current);
  reconnectTimerRef.current = setTimeout(connect, delay);
};

export const useChatSocket = ({ isAuthenticated, currentUser }) => {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutsRef = useRef(new Map());
  const roomRef = useRef(CHAT_ROOM_ID);
  const roomPageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const clearTypingUser = useCallback((username) => {
    setTypingUsers((prev) => {
      if (!prev.has(username)) return prev;
      const next = new Set(prev);
      next.delete(username);
      return next;
    });
  }, []);

  const scheduleTypingRemoval = useCallback(
    (username) => {
      const existing = typingTimeoutsRef.current.get(username);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(() => clearTypingUser(username), 3000);
      typingTimeoutsRef.current.set(username, timeout);
    },
    [clearTypingUser],
  );

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ event, data }));
    return true;
  }, []);

  const loadInitialHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      roomPageRef.current = 1;
      const result = await chatApi.getHistory(roomRef.current, 1, CHAT_PAGE_SIZE);
      const incoming = dedupeById(result?.messages || []);
      setMessages(incoming);
      hasMoreRef.current = !!result?.hasMore;
      setHasMore(!!result?.hasMore);
    } catch (error) {
      setHistoryError(error?.message || 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadMoreHistory = useCallback(async () => {
    if (!hasMoreRef.current || historyLoading) return;
    setHistoryLoading(true);
    try {
      const nextPage = roomPageRef.current + 1;
      const result = await chatApi.getHistory(roomRef.current, nextPage, CHAT_PAGE_SIZE);
      const incoming = dedupeById(result?.messages || []);
      roomPageRef.current = nextPage;
      hasMoreRef.current = !!result?.hasMore;
      setHasMore(!!result?.hasMore);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => String(msg._id)));
        const toPrepend = incoming.filter((msg) => !existingIds.has(String(msg._id)));
        return [...toPrepend, ...prev];
      });
    } catch (error) {
      setHistoryError(error?.message || 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [historyLoading]);

  const connect = useCallback(() => {
    if (!isAuthenticated || !currentUser) return;
    const token = getToken();
    if (!token) return;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const existing = socketRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    const ws = new WebSocket(`${toWsUrl()}?token=${encodeURIComponent(token)}`);
    socketRef.current = ws;

    ws.onopen = async () => {
      if (socketRef.current !== ws) return;
      setIsConnecting(false);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      setReconnectAttempt(0);
      emit('joinRoom', { roomId: roomRef.current });
      await loadInitialHistory();
    };

    ws.onmessage = (evt) => {
      if (socketRef.current !== ws) return;
      const packet = parseSocketPacket(evt.data);
      if (!packet) {
        setConnectionError('Malformed chat packet');
        return;
      }

      const { event, data } = packet;
      if (event === 'roomJoined') {
        syncRoomJoinedMessages(data, setMessages, setHasMore, hasMoreRef);
        roomPageRef.current = 1;
        return;
      }

      handleChatPacket({
        event,
        data,
        setMessages,
        setConnectionError,
        scheduleTypingRemoval,
        clearTypingUser,
      });
    };

    ws.onerror = () => {
      if (socketRef.current !== ws) return;
      setConnectionError('Connection error');
    };

    ws.onclose = async (event) => {
      if (socketRef.current === ws) {
        socketRef.current = null;
      }
      await handleSocketClose({
        event,
        isAuthenticated,
        setIsConnected,
        setIsConnecting,
        setConnectionError,
        setReconnectAttempt,
        reconnectAttemptsRef,
        reconnectTimerRef,
        connect,
      });
    };
  }, [clearTypingUser, currentUser, emit, isAuthenticated, loadInitialHistory, scheduleTypingRemoval]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      connect();
    } else {
      socketRef.current?.close();
      socketRef.current = null;
      setMessages([]);
      setTypingUsers(new Set());
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      typingTimeoutsRef.current.forEach((v) => clearTimeout(v));
      socketRef.current?.close();
    };
  }, [connect, currentUser, isAuthenticated]);

  const sendMessage = useCallback((payload) => emit('sendMessage', { roomId: roomRef.current, ...payload }), [emit]);
  const addReaction = useCallback((payload) => emit('addReaction', payload), [emit]);
  const removeReaction = useCallback((payload) => emit('removeReaction', payload), [emit]);
  const editMessage = useCallback((payload) => emit('editMessage', payload), [emit]);
  const deleteMessage = useCallback((payload) => emit('deleteMessage', payload), [emit]);
  const sendTyping = useCallback(() => emit('typing', { roomId: roomRef.current }), [emit]);
  const sendStopTyping = useCallback(() => emit('stopTyping', { roomId: roomRef.current }), [emit]);

  return useMemo(
    () => ({
      isConnected,
      isConnecting,
      connectionError,
      reconnectAttempt,
      messages,
      typingUsers,
      historyLoading,
      historyError,
      hasMore,
      loadMoreHistory,
      reloadHistory: loadInitialHistory,
      sendMessage,
      addReaction,
      removeReaction,
      editMessage,
      deleteMessage,
      sendTyping,
      sendStopTyping,
    }),
    [
      addReaction,
      connectionError,
      deleteMessage,
      editMessage,
      hasMore,
      historyError,
      historyLoading,
      isConnected,
      isConnecting,
      loadInitialHistory,
      loadMoreHistory,
      messages,
      reconnectAttempt,
      removeReaction,
      sendMessage,
      sendStopTyping,
      sendTyping,
      typingUsers,
    ],
  );
};

