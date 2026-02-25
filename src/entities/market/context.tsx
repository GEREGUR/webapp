import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  initialMarketState,
  marketReducer,
  mapDealToDropItem,
  mapTransactionToDropItem,
} from './model';
import { getWsUrl, parseWsEvent } from './websocket';
import { FALLBACK_TIMEOUT_MS, RECONNECT_DELAY_MS, MAX_RETRY_COUNT } from './config';
import type { DropItem, WsOrder, WsStats } from './types';

interface MarketContextValue {
  items: DropItem[];
  orders: WsOrder[];
  stats: WsStats | null;
  isLoading: boolean;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
};

interface MarketProviderProps {
  children: ReactNode;
}

export const MarketProvider = ({ children }: MarketProviderProps) => {
  const [state, dispatch] = useReducer(marketReducer, initialMarketState);
  const [isLoading, setIsLoading] = useState(true);
  const wsInitialized = useRef(false);

  useEffect(() => {
    const wsUrl = getWsUrl();

    const fallbackTimeout = setTimeout(() => {
      dispatch({ type: 'set_fallback' });
      setIsLoading(false);
    }, FALLBACK_TIMEOUT_MS);

    if (!wsUrl) {
      return () => clearTimeout(fallbackTimeout);
    }

    let socket: WebSocket | null = null;
    let reconnectTimeoutId: number | undefined;
    let retryCount = 0;
    let isUnmounted = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {};

      socket.onerror = () => {};

      socket.onmessage = (event) => {
        if (isUnmounted) return;

        if (typeof event.data !== 'string') {
          return;
        }

        const message = parseWsEvent(event.data);
        if (!message) {
          return;
        }

        if (message.type === 'initial_state') {
          const historyItems = (message.data.history ?? []).map((tx, i) =>
            mapTransactionToDropItem(tx, i)
          );
          wsInitialized.current = true;
          setIsLoading(false);
          dispatch({
            type: 'set_items',
            payload: historyItems.length > 0 ? historyItems.slice(0, 15) : [],
          });
          if (message.data.orders) {
            dispatch({ type: 'set_orders', payload: message.data.orders });
          }
          if (message.data.stats) {
            dispatch({ type: 'set_stats', payload: message.data.stats });
          }
          return;
        }

        if (message.type === 'new_order') {
          dispatch({ type: 'add_order', payload: message.data });
          return;
        }

        if (message.type === 'order_update') {
          dispatch({ type: 'update_order', payload: message.data });
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

      socket.onclose = () => {
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
    <MarketContext.Provider
      value={{ items: state.items, orders: state.orders, stats: state.stats, isLoading }}
    >
      {children}
    </MarketContext.Provider>
  );
};
