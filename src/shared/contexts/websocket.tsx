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

interface WsTransaction {
  id: number;
  type: string;
  currency: string;
  value: number;
  obj_id: number | null;
  create_date: number;
}

interface WsDeal {
  order_id: number;
  ton_amount: number;
  date?: number;
}

interface WsOrderOwner {
  id: number;
  avatar: string;
  name: string;
  username: string;
}

interface WsOrder {
  id: number;
  owner: WsOrderOwner;
  initial_bp_amount: number;
  initial_ton_amount: number;
  current_ton_amount: number;
  status: 'OPEN' | 'PARTIAL' | 'CLOSED';
  create_date: number;
}

interface WsStats {
  total_ton: number;
  total_orders: number;
}

interface WsInitialStateEvent {
  type: 'initial_state';
  data: {
    stats?: WsStats;
    orders?: WsOrder[];
    history?: WsTransaction[];
  };
}

interface WsNewOrderEvent {
  type: 'new_order';
  data: WsOrder;
}

interface WsOrderUpdate {
  id: number;
  current_ton_amount: number;
  status: 'PARTIAL' | 'CLOSED';
}

interface WsOrderUpdateEvent {
  type: 'order_update';
  data: WsOrderUpdate;
}

interface WsNewDealEvent {
  type: 'new_deal';
  data: WsDeal;
}

interface WsStatsUpdateEvent {
  type: 'stats_update';
  data: WsStats;
}

interface WsOrdersBumpEvent {
  type: 'orders_bump';
  data: {
    orders: WsOrder[];
  };
}

interface WsSuccessPaymentEvent {
  type: 'success_payment';
  data: {
    amount: number;
    tx_hash: string;
  };
}

interface WsSuccessWithdrawalEvent {
  type: 'success_withdrawal';
  data: {
    amount: number;
  };
}

type WsEvent =
  | WsInitialStateEvent
  | WsNewOrderEvent
  | WsOrderUpdateEvent
  | WsNewDealEvent
  | WsStatsUpdateEvent
  | WsOrdersBumpEvent
  | WsSuccessPaymentEvent
  | WsSuccessWithdrawalEvent;

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

  console.log(sourceUrl);

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

const isWsOrder = (value: unknown): value is WsOrder => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const order = value as WsOrder;
  return (
    typeof order.id === 'number' &&
    typeof order.initial_bp_amount === 'number' &&
    typeof order.initial_ton_amount === 'number' &&
    typeof order.current_ton_amount === 'number' &&
    typeof order.status === 'string' &&
    typeof order.create_date === 'number' &&
    order.owner !== undefined
  );
};

const isWsOrderUpdate = (value: unknown): value is WsOrderUpdate => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const update = value as WsOrderUpdate;
  return (
    typeof update.id === 'number' &&
    typeof update.current_ton_amount === 'number' &&
    (update.status === 'PARTIAL' || update.status === 'CLOSED')
  );
};

const isWsStats = (value: unknown): value is WsStats => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Record<string, unknown>;
  const totalTon = stats.total_ton;
  const totalOrders = stats.total_orders ?? stats.totaR_orders;
  return typeof totalTon === 'number' && typeof totalOrders === 'number';
};

const isWsTransaction = (value: unknown): value is WsTransaction => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tx = value as WsTransaction;
  return (
    typeof tx.id === 'number' &&
    typeof tx.type === 'string' &&
    typeof tx.currency === 'string' &&
    typeof tx.value === 'number' &&
    typeof tx.create_date === 'number'
  );
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
    const initialState = event.data as {
      stats?: unknown;
      orders?: unknown;
      history?: unknown;
    };

    const stats =
      initialState.stats && isWsStats(initialState.stats) ? initialState.stats : undefined;
    const orders = Array.isArray(initialState.orders)
      ? initialState.orders.filter(isWsOrder)
      : undefined;
    const history = Array.isArray(initialState.history)
      ? initialState.history.filter(isWsTransaction)
      : undefined;

    return {
      type: 'initial_state',
      data: { stats, orders, history },
    };
  }

  if (event.type === 'new_order' && isWsOrder(event.data)) {
    return {
      type: 'new_order',
      data: event.data,
    };
  }

  if (event.type === 'order_update' && isWsOrderUpdate(event.data)) {
    return {
      type: 'order_update',
      data: event.data,
    };
  }

  if (event.type === 'stats_update' && isWsStats(event.data)) {
    return {
      type: 'stats_update',
      data: event.data,
    };
  }

  if (event.type === 'orders_bump' && event.data && typeof event.data === 'object') {
    const bumpData = event.data as { orders?: unknown };
    if (Array.isArray(bumpData.orders)) {
      return {
        type: 'orders_bump',
        data: { orders: bumpData.orders.filter(isWsOrder) },
      };
    }
  }

  if (event.type === 'success_payment' && event.data && typeof event.data === 'object') {
    const paymentData = event.data as { amount?: unknown; tx_hash?: unknown };
    if (typeof paymentData.amount === 'number' && typeof paymentData.tx_hash === 'string') {
      return {
        type: 'success_payment',
        data: { amount: paymentData.amount, tx_hash: paymentData.tx_hash },
      };
    }
  }

  if (event.type === 'success_withdrawal' && event.data && typeof event.data === 'object') {
    const withdrawalData = event.data as { amount?: unknown };
    if (typeof withdrawalData.amount === 'number') {
      return {
        type: 'success_withdrawal',
        data: { amount: withdrawalData.amount },
      };
    }
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

const mapTransactionToDropItem = (tx: WsTransaction, index: number): DropItem => {
  return {
    id: tx.id,
    uid: `${tx.id}-${tx.create_date}-${index}`,
    tonAmount: tx.value,
    status: 'bought',
  };
};

type State = {
  items: DropItem[];
  stats: WsStats | null;
};

type Action =
  | { type: 'set_items'; payload: DropItem[] }
  | { type: 'push_item'; payload: DropItem }
  | { type: 'set_fallback' }
  | { type: 'set_stats'; payload: WsStats };

const initialState: State = {
  items: [],
  stats: null,
};

const itemsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_items':
      return { ...state, items: action.payload };
    case 'push_item':
      return { ...state, items: [action.payload, ...state.items].slice(0, MAX_ITEMS) };
    case 'set_fallback':
      return { ...state, items: state.items.length === 0 ? MOCK_LIVE_ITEMS : state.items };
    case 'set_stats':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

interface WebSocketContextValue {
  items: DropItem[];
  stats: WsStats | null;
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
  const [state, dispatch] = useReducer(itemsReducer, initialState);
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
          const historyItems = (message.data.history ?? []).map((tx, i) =>
            mapTransactionToDropItem(tx, i)
          );
          wsInitialized.current = true;
          dispatch({
            type: 'set_items',
            payload: historyItems.length > 0 ? historyItems.slice(0, MAX_ITEMS) : MOCK_LIVE_ITEMS,
          });
          if (message.data.stats) {
            dispatch({ type: 'set_stats', payload: message.data.stats });
          }
          return;
        }

        if (message.type === 'stats_update') {
          dispatch({ type: 'set_stats', payload: message.data });
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

  return (
    <WebSocketContext.Provider value={{ items: state.items, stats: state.stats }}>
      {children}
    </WebSocketContext.Provider>
  );
};
