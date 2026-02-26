import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { getWsUrl } from './websocket';
import { RECONNECT_DELAY_MS } from './config';
import type { WsEvent, WsOrder, WsStats, DropItem } from './types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const isDeal = (value: unknown): value is { order_id: number; ton_amount: number; date?: number } => {
  if (!value || typeof value !== 'object') return false;
  const deal = value as { order_id?: unknown; ton_amount?: unknown };
  return typeof deal.order_id === 'number' && typeof deal.ton_amount === 'number';
};

const isOrder = (value: unknown): value is WsOrder => {
  if (!value || typeof value !== 'object') return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === 'number' &&
    typeof order.initial_bp_amount === 'number' &&
    typeof order.initial_ton_amount === 'number' &&
    typeof order.current_ton_amount === 'number' &&
    typeof order.status === 'string' &&
    typeof order.create_date === 'number'
  );
};

const isOrderUpdate = (value: unknown): value is { id: number; current_ton_amount: number; status: 'PARTIAL' | 'CLOSED' } => {
  if (!value || typeof value !== 'object') return false;
  const update = value as Record<string, unknown>;
  return (
    typeof update.id === 'number' &&
    typeof update.current_ton_amount === 'number' &&
    (update.status === 'PARTIAL' || update.status === 'CLOSED')
  );
};

const isTransaction = (value: unknown): value is { id: number; type: string; currency: string; value: number; obj_id: number | null; create_date: number } => {
  if (!value || typeof value !== 'object') return false;
  const tx = value as Record<string, unknown>;
  return (
    typeof tx.id === 'number' &&
    typeof tx.type === 'string' &&
    typeof tx.currency === 'string' &&
    typeof tx.value === 'number' &&
    typeof tx.obj_id === 'number' &&
    typeof tx.create_date === 'number'
  );
};

interface MarketState {
  orders: WsOrder[];
  stats: WsStats | null;
  history: DropItem[];
}

const initialState: MarketState = {
  orders: [],
  stats: null,
  history: [],
};

class MarketWebSocketService {
  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>('disconnected');
  private marketState$ = new BehaviorSubject<MarketState>(initialState);

  private ordersSubject$ = new BehaviorSubject<WsOrder[]>([]);
  private statsSubject$ = new BehaviorSubject<WsStats | null>(null);
  private historySubject$ = new BehaviorSubject<DropItem[]>([]);

  private events$ = new Subject<WsEvent>();

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  getOrders(): Observable<WsOrder[]> {
    return this.ordersSubject$.asObservable();
  }

  getStats(): Observable<WsStats | null> {
    return this.statsSubject$.asObservable();
  }

  getHistory(): Observable<DropItem[]> {
    return this.historySubject$.asObservable();
  }

  getEvents(): Observable<WsEvent> {
    return this.events$.asObservable();
  }

  getState(): MarketState {
    return this.marketState$.getValue();
  }

  connect(): void {
    const wsUrl = getWsUrl();
    if (!wsUrl) {
      this.connectionStatus$.next('error');
      return;
    }

    this.connectionStatus$.next('connecting');

    this.socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: RECONNECT_DELAY_MS,
      reconnectionDelayMax: RECONNECT_DELAY_MS,
    });

    this.socket.on('connect', () => {
      this.connectionStatus$.next('connected');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus$.next('disconnected');
    });

    this.socket.on('connect_error', () => {
      this.connectionStatus$.next('error');
    });

    this.socket.on('message', (data: string) => {
      const event = this.parseEvent(data);
      if (event) {
        this.events$.next(event);
        this.handleEvent(event);
      }
    });
  }

  private parseEvent(data: string): WsEvent | null {
    let payload: unknown;
    try {
      payload = JSON.parse(data);
    } catch {
      return null;
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const event = payload as { type?: unknown; data?: unknown };

    if (event.type === 'new_deal' && isDeal(event.data)) {
      return { type: 'new_deal', data: event.data };
    }

    if (event.type === 'initial_state' && event.data && typeof event.data === 'object') {
      const initialState = event.data as {
        stats?: unknown;
        orders?: unknown;
        history?: unknown;
      };

      let stats: { total_ton: number; total_orders: number } | undefined;
      if (initialState.stats && typeof initialState.stats === 'object') {
        const rawStats = initialState.stats as Record<string, unknown>;
        const totalTon = rawStats.total_ton;
        const totalOrders = rawStats.total_orders ?? rawStats.totaR_orders;
        if (typeof totalTon === 'number' && typeof totalOrders === 'number') {
          stats = { total_ton: totalTon, total_orders: totalOrders };
        }
      }

      const orders = Array.isArray(initialState.orders)
        ? initialState.orders.filter(isOrder)
        : undefined;

      const history = Array.isArray(initialState.history)
        ? initialState.history.filter(isTransaction)
        : undefined;

      return { type: 'initial_state', data: { stats, orders, history } };
    }

    if (event.type === 'new_order' && isOrder(event.data)) {
      return { type: 'new_order', data: event.data };
    }

    if (event.type === 'order_update' && isOrderUpdate(event.data)) {
      return { type: 'order_update', data: event.data };
    }

    if (event.type === 'stats_update' && event.data && typeof event.data === 'object') {
      const rawStats = event.data as Record<string, unknown>;
      const totalTon = rawStats.total_ton;
      const totalOrders = rawStats.total_orders ?? rawStats.totaR_orders;
      if (typeof totalTon === 'number' && typeof totalOrders === 'number') {
        return { type: 'stats_update', data: { total_ton: totalTon, total_orders: totalOrders } };
      }
    }

    if (event.type === 'orders_bump' && event.data && typeof event.data === 'object') {
      const bumpData = event.data as { orders?: unknown };
      if (Array.isArray(bumpData.orders)) {
        return { type: 'orders_bump', data: { orders: bumpData.orders.filter(isOrder) } };
      }
    }

    if (event.type === 'success_payment' && event.data && typeof event.data === 'object') {
      const paymentData = event.data as { amount?: unknown; tx_hash?: unknown };
      if (typeof paymentData.amount === 'number' && typeof paymentData.tx_hash === 'string') {
        return { type: 'success_payment', data: { amount: paymentData.amount, tx_hash: paymentData.tx_hash } };
      }
    }

    if (event.type === 'success_withdrawal' && event.data && typeof event.data === 'object') {
      const withdrawalData = event.data as { amount?: unknown };
      if (typeof withdrawalData.amount === 'number') {
        return { type: 'success_withdrawal', data: { amount: withdrawalData.amount } };
      }
    }

    return null;
  }

  private handleEvent(event: WsEvent): void {
    const currentState = this.marketState$.getValue();

    switch (event.type) {
      case 'initial_state': {
        const historyItems = (event.data.history ?? []).slice(0, 15).map((tx, i) => ({
          id: tx.id || i,
          uid: `tx-${tx.id || i}`,
          tonAmount: tx.value,
          status: 'active' as const,
        }));

        const orders = event.data.orders ?? currentState.orders;
        const stats = event.data.stats ?? currentState.stats;

        this.marketState$.next({
          ...currentState,
          orders,
          stats,
          history: historyItems,
        });

        this.ordersSubject$.next(orders);
        this.statsSubject$.next(stats);
        this.historySubject$.next(historyItems);
        break;
      }

      case 'new_order': {
        const orders = [event.data, ...currentState.orders];
        this.marketState$.next({
          ...currentState,
          orders,
        });
        this.ordersSubject$.next(orders);
        break;
      }

      case 'order_update': {
        const orders = currentState.orders.map((order) =>
          order.id === event.data.id
            ? { ...order, current_ton_amount: event.data.current_ton_amount, status: event.data.status }
            : order
        );
        this.marketState$.next({
          ...currentState,
          orders,
        });
        this.ordersSubject$.next(orders);
        break;
      }

      case 'stats_update': {
        const stats = event.data;
        this.marketState$.next({
          ...currentState,
          stats,
        });
        this.statsSubject$.next(stats);
        break;
      }

      case 'new_deal': {
        const newItem: DropItem = {
          id: Date.now(),
          uid: `deal-${Date.now()}`,
          tonAmount: event.data.ton_amount,
          status: 'bought',
        };
        const history = [newItem, ...currentState.history].slice(0, 15);
        this.marketState$.next({
          ...currentState,
          history,
        });
        this.historySubject$.next(history);
        break;
      }

      case 'success_payment': {
        const newItem: DropItem = {
          id: Date.now(),
          uid: `deposit-${Date.now()}`,
          tonAmount: event.data.amount,
          status: 'active',
        };
        const history = [newItem, ...currentState.history].slice(0, 15);
        this.marketState$.next({
          ...currentState,
          history,
        });
        this.historySubject$.next(history);
        break;
      }

      case 'success_withdrawal': {
        const newItem: DropItem = {
          id: Date.now(),
          uid: `withdraw-${Date.now()}`,
          tonAmount: -event.data.amount,
          status: 'active',
        };
        const history = [newItem, ...currentState.history].slice(0, 15);
        this.marketState$.next({
          ...currentState,
          history,
        });
        this.historySubject$.next(history);
        break;
      }

      default:
        break;
    }
  }

  optimisticRemoveOrder(orderId: number): void {
    const currentOrders = this.ordersSubject$.getValue();
    const updatedOrders = currentOrders.filter((o) => o.id !== orderId);
    this.ordersSubject$.next(updatedOrders);
    this.marketState$.next({ ...this.marketState$.getValue(), orders: updatedOrders });
  }

  optimisticAddOrder(order: WsOrder): void {
    const currentOrders = this.ordersSubject$.getValue();
    const updatedOrders = [order, ...currentOrders];
    this.ordersSubject$.next(updatedOrders);
    this.marketState$.next({ ...this.marketState$.getValue(), orders: updatedOrders });
  }

  optimisticUpdateOrder(orderId: number, updates: Partial<WsOrder>): void {
    const currentOrders = this.ordersSubject$.getValue();
    const updatedOrders = currentOrders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    this.ordersSubject$.next(updatedOrders);
    this.marketState$.next({ ...this.marketState$.getValue(), orders: updatedOrders });
  }

  revertOrders(previousOrders: WsOrder[]): void {
    this.ordersSubject$.next(previousOrders);
    this.marketState$.next({ ...this.marketState$.getValue(), orders: previousOrders });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus$.next('disconnected');
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
    this.marketState$.next(initialState);
    this.events$.complete();
    this.connectionStatus$.next('disconnected');
    this.ordersSubject$.next([]);
    this.statsSubject$.next(null);
    this.historySubject$.next([]);
  }
}

export const marketWebSocketService = new MarketWebSocketService();
