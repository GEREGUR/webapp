import { type FC, type ReactNode, useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import { marketWsService } from './ws-service';
import type { DropItem, WsOrder, WsStats } from './types';

interface MarketContextValue {
  items: DropItem[];
  orders: WsOrder[];
  stats: WsStats | null;
  isLoading: boolean;
  setMinTonFilter: (minTon: number) => void;
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

export const MarketProvider: FC<MarketProviderProps> = ({ children }) => {
  const [contextValue, setContextValue] = useState<MarketContextValue>({
    items: [],
    orders: [],
    stats: null,
    isLoading: true,
    setMinTonFilter: marketWsService.setMinTonFilter.bind(marketWsService),
  });

  useEffect(() => {
    console.log('[MarketContext] useEffect running, connecting...');
    marketWsService.connect();

    console.log('[MarketContext] Subscribing to observables...');
    const subscriptions = [
      marketWsService.getItems().subscribe((items) => {
        console.log('[MarketContext] items subscription:', items.length);
        setContextValue((prev) => ({ ...prev, items }));
      }),
      marketWsService.getOrders().subscribe((orders) => {
        console.log('[MarketContext] orders subscription:', orders.length);
        setContextValue((prev) => ({ ...prev, orders }));
      }),
      marketWsService.getStats().subscribe((stats) => {
        console.log('[MarketContext] stats subscription:', stats);
        setContextValue((prev) => ({ ...prev, stats }));
      }),
      marketWsService.getIsLoading().subscribe((isLoading) => {
        console.log('[MarketContext] isLoading subscription:', isLoading);
        setContextValue((prev) => ({ ...prev, isLoading }));
      }),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
      marketWsService.disconnect();
    };
  }, []);

  return (
    <MarketContext.Provider value={contextValue}>
      {children}
    </MarketContext.Provider>
  );
};
