import { useEffect, useState, useCallback } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { motion, AnimatePresence } from 'motion/react';

export type DropItem = {
  id: number;
  uid: string;
  tonAmount: number;
  status?: 'bought' | 'active' | 'unavailable';
};

const MAX_ITEMS = 15;
const RECONNECT_DELAY_MS = 3000;
const MAX_RETRY_COUNT = 2;
const EMPTY_ITEMS: DropItem[] = [];

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

type Props = {
  initialItems?: DropItem[];
  renderItem: (item: DropItem) => React.ReactNode;
};

const getWsUrl = (): string | null => {
  const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
  const proxyTarget = import.meta.env.VITE_PROXY_TARGET as string | undefined;
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

  const wsProtocol = parsedApiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const basePath = parsedApiUrl.pathname.replace(/\/+$/, '');

  let wsPath = '/api/v1/socket/ws';
  if (basePath.endsWith('/api/v1')) {
    wsPath = `${basePath.replace(/\/v1$/, '')}/socket/ws`;
  } else if (basePath.endsWith('/api')) {
    wsPath = `${basePath}/socket/ws`;
  }

  const wsUrl = new URL(`${wsProtocol}//${parsedApiUrl.host}`);
  wsUrl.pathname = wsPath;

  const initData = retrieveLaunchParams();
  if (initData) {
    wsUrl.searchParams.set('auth', initData.tgWebAppData?.user?.id.toString() ?? '');
  }

  return wsUrl.toString();
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

export const LiveCarousel = ({ initialItems = EMPTY_ITEMS, renderItem }: Props) => {
  const [items, setItems] = useState<DropItem[]>(initialItems);

  const pushItem = useCallback((item: DropItem) => {
    setItems((prev) => {
      const next = [item, ...prev];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  useEffect(() => {
    const wsUrl = getWsUrl();

    const fallbackTimeout = setTimeout(() => {
      setItems((current) => (current.length === 0 ? MOCK_LIVE_ITEMS : current));
    }, 3000);

    if (!wsUrl) {
      return () => clearTimeout(fallbackTimeout);
    }

    let socket: WebSocket | null = null;
    let reconnectTimeoutId: number | undefined;
    let isUnmounted = false;
    let retryCount = 0;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        if (typeof event.data !== 'string') {
          return;
        }

        const message = parseWsEvent(event.data);
        if (!message) {
          return;
        }

        if (message.type === 'initial_state') {
          const historyItems = (message.data.history ?? []).map(mapDealToDropItem);
          setItems(historyItems.length > 0 ? historyItems.slice(0, MAX_ITEMS) : MOCK_LIVE_ITEMS);
          return;
        }

        if (message.type === 'new_deal') {
          pushItem(mapDealToDropItem(message.data));
        }
      };

      socket.onclose = () => {
        if (isUnmounted) {
          return;
        }

        if (retryCount < MAX_RETRY_COUNT) {
          retryCount++;
          reconnectTimeoutId = window.setTimeout(connect, RECONNECT_DELAY_MS);
        } else {
          setItems((current) => (current.length === 0 ? MOCK_LIVE_ITEMS : current));
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
  }, [pushItem]);

  return (
    <div className="relative mt-2.5 w-full overflow-hidden">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto overflow-y-hidden py-0.5">
        <div className="bg-ghost flex w-6 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl pt-1.5">
          <span className="-rotate-90 text-[10px] font-bold whitespace-nowrap">Live</span>
          <div className="size-2 animate-pulse rounded-full bg-[#5F81D8]" />
        </div>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.uid}
              layout
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 25,
              }}
            >
              {renderItem(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
