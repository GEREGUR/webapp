import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { map, takeUntil, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { getWsUrl, parseWsEvent } from './websocket';
import { FALLBACK_TIMEOUT_MS, RECONNECT_DELAY_MS, MAX_RETRY_COUNT } from './config';
import type { WsOrder, WsStats, WsEvent, DropItem, WsDeal, WsTransaction } from './types';
import { mockDropItems, mockMarketStats, mockOrders } from '@/pages/index-page/lib/mock-data';

export interface MarketState {
  orders: WsOrder[];
  stats: WsStats | null;
  items: DropItem[];
  isConnected: boolean;
  isLoading: boolean;
}

export interface OptimisticOrder {
  tempId: string;
  order: WsOrder;
  timestamp: number;
}

const initialState: MarketState = {
  orders: [],
  stats: null,
  items: [],
  isConnected: false,
  isLoading: true,
};
const MAX_LOCAL_ORDERS = 50;

class MarketWebSocketService {
  private state$ = new BehaviorSubject<MarketState>(initialState);
  private destroy$ = new Subject<void>();
  private socket$: WebSocketSubject<unknown> | null = null;
  private optimisticOrders: OptimisticOrder[] = [];
  private reconnectAttempts = 0;
  private wsUrl: string | null = null;
  private isReconnecting = false;
  private isManualDisconnect = false;
  private minTonFilter = 0;
  private connectionId = 0;
  private allOrders: WsOrder[] = [];

  private orders$ = this.state$.pipe(
    map((state) => state.orders),
    distinctUntilChanged()
  );

  private stats$ = this.state$.pipe(
    map((state) => state.stats),
    distinctUntilChanged()
  );

  private items$ = this.state$.pipe(
    map((state) => state.items),
    distinctUntilChanged()
  );

  private isConnected$ = this.state$.pipe(
    map((state) => state.isConnected),
    distinctUntilChanged()
  );

  private isLoading$ = this.state$.pipe(
    map((state) => state.isLoading),
    distinctUntilChanged()
  );

  private events$ = new Subject<WsEvent>();

  getState(): Observable<MarketState> {
    return this.state$.asObservable();
  }

  getOrders(): Observable<WsOrder[]> {
    return this.orders$;
  }

  getStats(): Observable<WsStats | null> {
    return this.stats$;
  }

  getItems(): Observable<DropItem[]> {
    return this.items$;
  }

  getIsConnected(): Observable<boolean> {
    return this.isConnected$;
  }

  getIsLoading(): Observable<boolean> {
    return this.isLoading$;
  }

  getEvents(): Observable<WsEvent> {
    return this.events$.asObservable();
  }

  connect(): void {
    console.log('[MarketWsService] connect() called');
    this.isManualDisconnect = false;
    if (this.wsUrl || this.state$.value.isConnected) {
      console.log('[MarketWsService] Already connected/connecting, skipping');
      return;
    }

    this.wsUrl = getWsUrl();
    console.log('[MarketWsService] WS URL:', this.wsUrl);

    if (!this.wsUrl) {
      console.log('[MarketWsService] No WS URL, setting fallback');
      this.setFallback();
      return;
    }

    timer(FALLBACK_TIMEOUT_MS)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.state$.value.isLoading)
      )
      .subscribe(() => {
        console.log('[MarketWsService] Fallback timeout reached');
        this.setFallback();
      });

    this.initWebSocket();
  }

  private initWebSocket(): void {
    if (!this.wsUrl) return;

    console.log('[MarketWsService] Initializing WebSocket...');
    const currentConnectionId = ++this.connectionId;

    this.socket$ = webSocket<unknown>({
      url: this.wsUrl,
      openObserver: {
        next: () => {
          if (currentConnectionId !== this.connectionId) {
            return;
          }
          console.log('[MarketWsService] WebSocket connected!');
          this.reconnectAttempts = 0;
          this.updateState({ isConnected: true });
          this.sendFilterUpdate(this.minTonFilter);
        },
      },
      closeObserver: {
        next: () => {
          if (currentConnectionId !== this.connectionId) {
            return;
          }
          console.log('[MarketWsService] WebSocket closed');
          this.updateState({ isConnected: false });
          if (this.isManualDisconnect) {
            return;
          }
          this.handleReconnect();
        },
      },
    });

    this.socket$
      .pipe(
        takeUntil(this.destroy$),
        map((rawMessage) => {
          console.log('[MarketWsService] Raw message type:', typeof rawMessage, rawMessage);
          const messageStr =
            typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
          console.log('[MarketWsService] Raw message received:', messageStr.substring(0, 200));
          return messageStr;
        }),
        map((rawMessage) => parseWsEvent(rawMessage)),
        tap((event) => console.log('[MarketWsService] Parsed event:', event)),
        filter(
          (event): event is WsEvent =>
            typeof event === 'object' && event !== null && 'data' in event && 'type' in event
        ),
        tap((event) => this.events$.next(event)),
        tap((event) => this.handleEvent(event))
      )
      .subscribe({
        error: (err) => {
          console.error('[MarketWsService] WebSocket error:', err);
        },
      });
  }

  private handleEvent(event: WsEvent): void {
    console.log('[MarketWsService] Received event:', event.type, event.data);
    const currentState = this.state$.value;

    switch (event.type) {
      case 'initial_state': {
        const historyItems = (event.data.history ?? []).map((tx, i) =>
          this.mapTransactionToDropItem(tx, i)
        );
        this.applyOrders(event.data.orders ?? []);
        this.updateState({
          stats: event.data.stats,
          items: historyItems.slice(0, 5),
          isLoading: false,
        });
        break;
      }

      case 'new_order': {
        const existingOrder = this.allOrders.find((o) => o.id === event.data.id);
        if (!existingOrder) {
          const optimisticOrder = this.findOptimisticOrder(event.data.id);
          if (optimisticOrder) {
            this.removeOptimisticOrder(optimisticOrder.tempId);
          }
          this.applyOrders([event.data, ...this.allOrders]);
        }
        break;
      }

      case 'order_update': {
        const updatedOrders = this.allOrders.map((order) => {
          if (order.id === event.data.id) {
            return {
              ...order,
              current_ton_amount: event.data.current_ton_amount,
              status: event.data.status,
            };
          }
          return order;
        });

        this.applyOrders(
          updatedOrders.filter((order) => {
            if (order.id !== event.data.id) {
              return true;
            }
            return order.status !== 'CLOSED';
          })
        );
        break;
      }

      case 'stats_update': {
        if (event.data.total_orders < this.allOrders.length) {
          this.applyOrders(this.allOrders.slice(0, event.data.total_orders));
        }
        this.updateState({ stats: event.data });
        break;
      }

      case 'new_deal': {
        const newItem = this.mapDealToDropItem(event.data);
        this.updateState({ items: [newItem, ...currentState.items.slice(0, 14)] });
        break;
      }

      case 'orders_bump': {
        const bumpedOrders = event.data.orders;
        const bumpedOrderIds = new Set(bumpedOrders.map((order) => order.id));
        const remainingOrders = this.allOrders.filter((order) => !bumpedOrderIds.has(order.id));

        this.applyOrders([...bumpedOrders, ...remainingOrders]);
        break;
      }

      case 'success_payment':
      case 'success_withdrawal': {
        break;
      }
    }
  }

  private handleReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= MAX_RETRY_COUNT) {
      console.log(
        '[MarketWsService] Max retries reached or already reconnecting, setting fallback'
      );
      this.setFallback();
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * this.reconnectAttempts;

    console.log(
      `[MarketWsService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RETRY_COUNT})`
    );

    timer(delay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isReconnecting = false;
        this.initWebSocket();
      });
  }

  private setFallback(): void {
    if (import.meta.env.DEV) {
      this.setMockData({ orders: mockOrders, stats: mockMarketStats, items: mockDropItems });
      return;
    }

    this.updateState({
      isLoading: false,
      isConnected: false,
    });
  }

  setMinTonFilter(minTon: number): void {
    const normalizedMinTon = Number.isFinite(minTon) ? Math.max(0, minTon) : 0;
    this.minTonFilter = normalizedMinTon;
    this.updateState({ orders: this.filterOrders(this.allOrders) });
    this.sendFilterUpdate(normalizedMinTon);
  }

  private sendFilterUpdate(minTon: number): void {
    if (!this.socket$ || !this.state$.value.isConnected) {
      return;
    }

    this.socket$.next({
      type: 'update_filter',
      min_ton: minTon,
    });
  }

  private updateState(partial: Partial<MarketState>): void {
    console.log('[MarketWsService] updateState called with:', Object.keys(partial));
    this.state$.next({ ...this.state$.value, ...partial });
    console.log('[MarketWsService] New state:', {
      orders: this.state$.value.orders.length,
      stats: this.state$.value.stats,
      items: this.state$.value.items.length,
      isLoading: this.state$.value.isLoading,
    });
  }

  private applyOrders(orders: WsOrder[]): void {
    this.allOrders = orders.slice(0, MAX_LOCAL_ORDERS);
    this.updateState({ orders: this.filterOrders(this.allOrders) });
  }

  private filterOrders(orders: WsOrder[]): WsOrder[] {
    if (this.minTonFilter <= 0) {
      return orders;
    }

    return orders.filter((order) => order.current_ton_amount >= this.minTonFilter);
  }

  private findOptimisticOrder(orderId: number): OptimisticOrder | undefined {
    return this.optimisticOrders.find(
      (o) => o.order.id === orderId && Date.now() - o.timestamp < 30000
    );
  }

  private removeOptimisticOrder(tempId: string): void {
    this.optimisticOrders = this.optimisticOrders.filter((o) => o.tempId !== tempId);
  }

  addOptimisticOrder(order: WsOrder): string {
    const tempId = `optimistic_${Date.now()}_${order.id}`;
    this.optimisticOrders.push({
      tempId,
      order,
      timestamp: Date.now(),
    });

    const currentState = this.state$.value;
    this.updateState({
      orders: [order, ...currentState.orders],
    });

    return tempId;
  }

  removeOptimisticOrderByTempId(tempId: string): void {
    const optimistic = this.optimisticOrders.find((o) => o.tempId === tempId);
    if (optimistic) {
      const currentState = this.state$.value;
      this.updateState({
        orders: currentState.orders.filter((o) => o.id !== optimistic.order.id),
      });
      this.removeOptimisticOrder(tempId);
    }
  }

  bumpOrder(orderId: number): void {
    const currentState = this.state$.value;
    const orderIndex = currentState.orders.findIndex((o) => o.id === orderId);
    if (orderIndex > 0) {
      const updatedOrders = [...currentState.orders];
      const [order] = updatedOrders.splice(orderIndex, 1);
      updatedOrders.unshift(order);
      this.updateState({ orders: updatedOrders });
    }
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    this.connectionId++;
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    this.destroy$.next();
    this.wsUrl = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.optimisticOrders = [];
    this.allOrders = [];
    this.state$.next(initialState);
  }

  setMockData(data: { orders?: WsOrder[]; stats?: WsStats; items?: DropItem[] }): void {
    if (data.orders) {
      this.allOrders = data.orders.slice(0, MAX_LOCAL_ORDERS);
    }
    this.updateState({
      orders: data.orders ? this.filterOrders(data.orders) : [],
      stats: data.stats ?? null,
      items: data.items ?? [],
      isLoading: false,
      isConnected: true,
    });
  }

  private mapDealToDropItem(deal: WsDeal): DropItem {
    return {
      id: deal.order_id,
      uid: `deal_${deal.order_id}_${deal.date ?? Date.now()}`,
      tonAmount: deal.ton_amount,
      status: 'bought',
    };
  }

  private mapTransactionToDropItem(tx: WsTransaction, index: number): DropItem {
    return {
      id: tx.id,
      uid: `tx_${tx.id}_${index}`,
      tonAmount: tx.value,
      status: tx.type === 'buy' ? 'bought' : 'active',
    };
  }
}

export const marketWsService = new MarketWebSocketService();
