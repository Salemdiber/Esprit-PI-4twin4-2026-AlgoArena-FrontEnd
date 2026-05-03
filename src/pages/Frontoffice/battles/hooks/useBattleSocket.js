import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getToken } from '../../../../services/cookieUtils';

const toAbsoluteWsUrl = (value) => {
  if (!value) return null;
  if (/^wss?:\/\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/^http/i, 'ws');
  }
  return null;
};

const toWsUrl = () => {
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && envApi.startsWith('http')) {
    return envApi.replace(/^http/i, 'ws').replace(/\/api\/?$/, '') + '/battles/ws';
  }

  const envWs = import.meta.env.VITE_WS_URL;
  const absoluteEnvWs = toAbsoluteWsUrl(envWs);
  if (absoluteEnvWs) {
    return absoluteEnvWs.replace(/\/chat\/ws$/, '/battles/ws');
  }

  if (envWs && envWs.startsWith('/')) {
    // Relative ws paths can accidentally target the frontend dev server.
    // Default to backend :3000 in local development.
    const secure = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${secure}://${window.location.hostname}:3000${envWs.replace(/\/chat\/ws$/, '/battles/ws')}`;
  }

  return 'ws://localhost:3000/battles/ws';
};

export const useBattleSocket = ({
  isAuthenticated,
  battleId,
  onBattleJoined,
  onRoundResult,
}) => {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ event, data }));
    return true;
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !battleId) return;
    const token = getToken();
    if (!token) return;

    const existing = socketRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const ws = new WebSocket(`${toWsUrl()}?token=${encodeURIComponent(token)}`);
    socketRef.current = ws;

    ws.onopen = () => {
      if (socketRef.current !== ws) return;
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      emit('watchBattle', { battleId });
    };

    ws.onmessage = (evt) => {
      if (socketRef.current !== ws) return;
      try {
        const packet = JSON.parse(evt.data);
        const { event, data } = packet || {};
        if (event === 'battleJoined') {
          onBattleJoined?.(data);
        }
        if (event === 'battleRoundResult') {
          onRoundResult?.(data);
        }
      } catch {
        // ignore malformed packets
      }
    };

    ws.onclose = () => {
      if (socketRef.current === ws) socketRef.current = null;
      setIsConnected(false);
      if (!isAuthenticated || !battleId) return;

      reconnectAttemptsRef.current += 1;
      const delay = Math.min(15000, 1000 * 2 ** (reconnectAttemptsRef.current - 1));
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // handled by close
    };
  }, [battleId, emit, isAuthenticated, onBattleJoined, onRoundResult]);

  useEffect(() => {
    const startConnection = () => connect();
    const timerId = window.setTimeout(startConnection, 3000);

    return () => {
      window.clearTimeout(timerId);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      emit('unwatchBattle', { battleId });
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [battleId, connect, emit]);

  const sendRoundResult = useCallback(
    ({ roundIndex, result }) => {
      if (!battleId) return;
      emit('battleRoundResult', { battleId, roundIndex, result });
    },
    [battleId, emit],
  );

  return useMemo(
    () => ({
      isConnected,
      sendRoundResult,
    }),
    [isConnected, sendRoundResult],
  );
};

export default useBattleSocket;
