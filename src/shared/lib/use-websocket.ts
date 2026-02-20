import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

export interface WebSocketOptions {
  url: string;
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  shouldReconnect?: boolean;
}

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  send: (data: string | ArrayBuffer | Blob) => void;
  sendJson: (data: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (options: WebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    shouldReconnect = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (event) => {
      setStatus('open');
      reconnectCountRef.current = 0;
      onOpen?.(event);
    };

    ws.onclose = (event) => {
      setStatus('closed');
      onClose?.(event);

      if (shouldReconnect && reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (event) => {
      setStatus('error');
      onError?.(event);
    };

    ws.onmessage = (event) => {
      onMessage?.(event);
    };
  }, [
    url,
    onOpen,
    onClose,
    onMessage,
    onError,
    shouldReconnect,
    reconnectAttempts,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectCountRef.current = reconnectAttempts;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [reconnectAttempts]);

  const send = useCallback((data: string | ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const sendJson = useCallback(
    (data: unknown) => {
      send(JSON.stringify(data));
    },
    [send]
  );

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    send,
    sendJson,
    connect,
    disconnect,
  };
};
