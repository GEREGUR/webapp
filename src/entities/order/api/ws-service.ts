import { retrieveLaunchParams } from '@tma.js/sdk-react';
import type { Order, Deal, MarketStats } from './api.dto';

export type WsEventType =
  | 'initial_state'
  | 'new_order'
  | 'order_update'
  | 'new_deal'
  | 'stats_update'
  | 'orders_bump'
  | 'success_payment'
  | 'success_withdrawal'
  | 'update_filter';

export interface WsMessage<T = unknown> {
  type: WsEventType;
  data: T;
}

export interface InitialStateData {
  stats: MarketStats;
  orders: Order[];
  history: Deal[];
}

export type NewOrderData = Order;

export interface OrderUpdateData {
  id: number;
  current_ton_amount: number;
  status: 'PARTIAL' | 'CLOSED';
}

export interface NewDealData {
  order_id: number;
  ton_amount: number;
}

export interface StatsUpdateData {
  total_ton: number;
  total_orders: number;
}

export interface OrdersBumpData {
  orders: Order[];
}

export interface SuccessPaymentData {
  amount: number;
  tx_hash: string;
}

export interface SuccessWithdrawalData {
  amount: number;
}

type EventCallback<T = unknown> = (data: T) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<WsEventType, Set<EventCallback>> = new Map();
  private isConnected = false;
  private shouldReconnect = true;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const launchParams = retrieveLaunchParams();
      let initData = '';
      
      try {
        initData = typeof launchParams.tgWebAppData === 'string' 
          ? launchParams.tgWebAppData 
          : JSON.stringify(launchParams.tgWebAppData);
      } catch {
        initData = '';
      }
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.url = `${protocol}//${host}/api/order/ws?x_telegram_data=${encodeURIComponent(initData)}`;

      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(event.data as string);
          if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
            const message = parsed as { type: WsEventType; data: unknown };
            this.emit(message.type, message.data);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: WsEventType, data?: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...(data || {}) }));
    }
  }

  updateFilter(minTon: number) {
    this.send('update_filter', { min_ton: minTon });
  }

  on<T = unknown>(event: WsEventType, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => this.off(event, callback);
  }

  off<T = unknown>(event: WsEventType, callback: EventCallback<T>) {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  private emit<T = unknown>(event: WsEventType, data: T) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
