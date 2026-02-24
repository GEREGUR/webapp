import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

type DropItem = {
  id: number;
  uid: string;
  tonAmount: number;
  status?: 'bought' | 'active' | 'unavailable';
};

const MAX_ITEMS = 15;
const RECONNECT_DELAY_MS = 3000;
const MAX_RETRY_COUNT = 2;

const MOCK_LIVE_ITEMS: DropItem[] = [
  { id: 1, uid: 'mock-1', tonAmount: 0.5, status: 'bought' },
  { id: 2, uid: 'mock-2', tonAmount: 1.2, status: 'bought' },
  { id: 3, uid: 'mock-3', tonAmount: 0.8, status: 'bought' },
  { id: 4, uid: 'mock-4', tonAmount: 2.5, status: 'bought' },
  { id: 5, uid: 'mock-5', tonAmount: 1.8, status: 'bought' },
];

interface WsDeal {
  order_id: number;
  ton_amount: number;
  date?: number;
}

interface WsInitialStateEvent {
  type: 'initial_state';
  data: {
    history?: WsDeal[];
  };
}

interface WsNewDealEvent {
  type: 'new_deal';
  data: WsDeal;
}

type WsEvent = WsInitialStateEvent | WsNewDealEvent;

const getWsUrl = (): string | null => {
  const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
  const proxyTarget = import.meta.env.VITE_PROXY_TARGET as string | undefined;
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const fallbackUrl = window.location.origin;
  const sourceUrl =
    apiBaseUrl && /^https?:\/\//.test(apiBaseUrl)
      ? apiBaseUrl
      : proxyTarget && /^https?:\/\//.test(proxyTarget)
        ? proxyTarget
        : apiBaseUrl || fallbackUrl;

  let parsedApiUrl: URL;
  try {
    parsedApiUrl = new URL(sourceUrl, fallbackUrl);
  } catch {
    return null;
  }

  const wsPath = '/api/v1/socket/ws';

  let wsHost: string;
  if (wsUrl) {
    try {
      const parsedWsUrl = new URL(wsUrl);
      wsHost = parsedWsUrl.host;
    } catch {
      wsHost = parsedApiUrl.host;
    }
  } else {
    wsHost = parsedApiUrl.host;
  }

  const socketUrl = new URL(`wss://${wsHost}`);
  socketUrl.pathname = wsPath;

  try {
    const initData = retrieveLaunchParams();
    if (initData?.tgWebAppData?.user?.id) {
      socketUrl.searchParams.set('auth', initData.tgWebAppData.user.id.toString());
    }
  } catch {
    // Telegram SDK not ready yet
  }

  return socketUrl.toString();
};

const isWsDeal = (value: unknown): value is WsDeal => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const deal = value as WsDeal;
  return typeof deal.order_id === 'number' && typeof deal.ton_amount === 'number';
};

const parseWsEvent = (rawMessage: string): WsEvent | null => {
  let payload: unknown;
  try {
    payload = JSON.parse(rawMessage);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const event = payload as { type?: unknown; data?: unknown };

  if (event.type === 'new_deal' && isWsDeal(event.data)) {
    return {
      type: 'new_deal',
      data: event.data,
    };
  }

  if (event.type === 'initial_state' && event.data && typeof event.data === 'object') {
    const initialState = event.data as { history?: unknown };
    const history = Array.isArray(initialState.history)
      ? initialState.history.filter(isWsDeal)
      : undefined;

    return {
      type: 'initial_state',
      data: { history },
    };
  }

  return null;
};

const mapDealToDropItem = (deal: WsDeal): DropItem => {
  return {
    id: deal.order_id,
    uid: `${deal.order_id}-${deal.date ?? Date.now()}-${Math.random().toString(16).slice(2)}`,
    tonAmount: deal.ton_amount,
    status: 'bought',
  };
};

type State = DropItem[];

type Action =
  | { type: 'set_items'; payload: DropItem[] }
  | { type: 'push_item'; payload: DropItem }
  | { type: 'set_fallback' };

const itemsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_items':
      return action.payload;
    case 'push_item':
      return [action.payload, ...state].slice(0, MAX_ITEMS);
    case 'set_fallback':
      return state.length === 0 ? MOCK_LIVE_ITEMS : state;
    default:
      return state;
  }
};

interface WebSocketContextValue {
  items: DropItem[];
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useLiveDeals = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useLiveDeals must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [items, dispatch] = useReducer(itemsReducer, []);
  const wsInitialized = useRef(false);

  useEffect(() => {
    const wsUrl = getWsUrl();
    console.log('[WebSocket] Initializing with URL:', wsUrl);

    const fallbackTimeout = setTimeout(() => {
      console.log('[WebSocket] Fallback timeout reached, using mock data');
      dispatch({ type: 'set_fallback' });
    }, 3000);

    if (!wsUrl) {
      console.log('[WebSocket] No URL available, using mock data');
      return () => clearTimeout(fallbackTimeout);
    }

    let socket: WebSocket | null = null;
    let reconnectTimeoutId: number | undefined;
    let retryCount = 0;
    let isUnmounted = false;

    const connect = () => {
      console.log('[WebSocket] Connecting to:', wsUrl, 'retry:', retryCount);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WebSocket] Connected successfully');
      };

      socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      socket.onmessage = (event) => {
        if (isUnmounted) return;
        console.log('[WebSocket] Received message:', event.data);

        if (typeof event.data !== 'string') {
          return;
        }

        const message = parseWsEvent(event.data);
        if (!message) {
          console.log('[WebSocket] Failed to parse message');
          return;
        }

        if (message.type === 'initial_state') {
          const historyItems = (message.data.history ?? []).map(mapDealToDropItem);
          wsInitialized.current = true;
          dispatch({
            type: 'set_items',
            payload: historyItems.length > 0 ? historyItems.slice(0, MAX_ITEMS) : MOCK_LIVE_ITEMS,
          });
          return;
        }

        if (message.type === 'new_deal') {
          dispatch({ type: 'push_item', payload: mapDealToDropItem(message.data) });
        }
      };

      socket.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        if (isUnmounted) return;

        if (retryCount < MAX_RETRY_COUNT) {
          retryCount++;
          reconnectTimeoutId = window.setTimeout(connect, RECONNECT_DELAY_MS);
        } else {
          dispatch({ type: 'set_fallback' });
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(fallbackTimeout);
      if (reconnectTimeoutId) {
        window.clearTimeout(reconnectTimeoutId);
      }
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  }, []);

  return <WebSocketContext.Provider value={{ items }}>{children}</WebSocketContext.Provider>;
};
