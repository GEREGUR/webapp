import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { marketWebSocketService } from './ws-service';
import type { WsOrder, WsStats, DropItem } from './types';

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
  const [items, setItems] = useState<DropItem[]>([]);
  const [orders, setOrders] = useState<WsOrder[]>([]);
  const [stats, setStats] = useState<WsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    marketWebSocketService.connect();

    const ordersSub = marketWebSocketService.getOrders().subscribe((newOrders) => {
      setOrders(newOrders);
      setIsLoading(false);
    });

    const statsSub = marketWebSocketService.getStats().subscribe((newStats) => {
      setStats(newStats);
    });

    const historySub = marketWebSocketService.getHistory().subscribe((newHistory) => {
      setItems(newHistory);
    });

    return () => {
      ordersSub.unsubscribe();
      statsSub.unsubscribe();
      historySub.unsubscribe();
    };
  }, []);

  return (
    <MarketContext.Provider value={{ items, orders, stats, isLoading }}>
      {children}
    </MarketContext.Provider>
  );
};
