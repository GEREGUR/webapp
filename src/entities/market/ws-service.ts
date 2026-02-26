import { BehaviorSubject, Subject, Observable, timer, EMPTY } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  catchError,
  filter,
  map,
  retry,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { getWsUrl, parseWsEvent } from './websocket';
import { RECONNECT_DELAY_MS } from './config';
import type { WsEvent, WsOrder, WsStats, DropItem } from './types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

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
  private socket$: WebSocketSubject<string> | null = null;
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

    timer(0, RECONNECT_DELAY_MS)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.socket$) {
            this.socket$.complete();
          }

          this.socket$ = webSocket<string>({
            url: wsUrl,
            openObserver: {
              next: () => {
                this.connectionStatus$.next('connected');
              },
            },
            closeObserver: {
              next: () => {
                this.connectionStatus$.next('disconnected');
              },
            },
          });

          return this.socket$.pipe(
            tap({
              error: () => {
                this.connectionStatus$.next('error');
              },
            }),
            map((message) => parseWsEvent(message)),
            filter((event): event is WsEvent => event !== null),
            tap((event) => {
              this.events$.next(event);
              this.handleEvent(event);
            }),
            catchError((error) => {
              console.error('WebSocket error:', error);
              this.connectionStatus$.next('error');
              return EMPTY;
            }),
            retry({ count: 5, delay: RECONNECT_DELAY_MS })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
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
