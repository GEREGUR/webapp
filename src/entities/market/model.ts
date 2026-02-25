import type { DropItem, WsOrder, WsOrderUpdate, WsStats } from './types';
import { MAX_ITEMS, MOCK_LIVE_ITEMS } from './config';

export type MarketState = {
  items: DropItem[];
  orders: WsOrder[];
  stats: WsStats | null;
};

export type MarketAction =
  | { type: 'set_items'; payload: DropItem[] }
  | { type: 'push_item'; payload: DropItem }
  | { type: 'set_fallback' }
  | { type: 'set_orders'; payload: WsOrder[] }
  | { type: 'add_order'; payload: WsOrder }
  | { type: 'update_order'; payload: WsOrderUpdate }
  | { type: 'set_stats'; payload: WsStats };

export const initialMarketState: MarketState = {
  items: [],
  orders: [],
  stats: null,
};

export const marketReducer = (state: MarketState, action: MarketAction): MarketState => {
  switch (action.type) {
    case 'set_items':
      return { ...state, items: action.payload };
    case 'push_item':
      return { ...state, items: [action.payload, ...state.items].slice(0, MAX_ITEMS) };
    case 'set_fallback':
      return { ...state, items: state.items.length === 0 ? MOCK_LIVE_ITEMS : state.items };
    case 'set_orders':
      return { ...state, orders: action.payload };
    case 'add_order':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'update_order': {
      const { id, current_ton_amount, status } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, current_ton_amount, status } : order
        ),
      };
    }
    case 'set_stats':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

export const mapDealToDropItem = (deal: {
  order_id: number;
  ton_amount: number;
  date?: number;
}): DropItem => {
  return {
    id: deal.order_id,
    uid: `${deal.order_id}-${deal.date ?? Date.now()}-${Math.random().toString(16).slice(2)}`,
    tonAmount: deal.ton_amount,
    status: 'bought',
  };
};

export const mapTransactionToDropItem = (
  tx: { id: number; value: number; create_date: number },
  index: number
): DropItem => {
  return {
    id: tx.id,
    uid: `${tx.id}-${tx.create_date}-${index}`,
    tonAmount: tx.value,
    status: 'bought',
  };
};
