export interface WsOrderOwner {
  id: number;
  avatar: string;
  name: string;
  username: string;
}

export interface WsOrder {
  id: number;
  owner: WsOrderOwner;
  initial_bp_amount: number;
  initial_ton_amount: number;
  current_ton_amount: number;
  status: 'OPEN' | 'PARTIAL' | 'CLOSED';
  create_date: number;
}

export interface WsStats {
  total_ton: number;
  total_orders: number;
}

export interface WsTransaction {
  id: number;
  type: string;
  currency: string;
  value: number;
  obj_id: number | null;
  create_date: number;
}

export interface WsDeal {
  order_id: number;
  ton_amount: number;
  date?: number;
}

export interface WsOrderUpdate {
  id: number;
  current_ton_amount: number;
  status: 'PARTIAL' | 'CLOSED';
}

export interface WsInitialStateEvent {
  type: 'initial_state';
  data: {
    stats?: WsStats;
    orders?: WsOrder[];
    history?: WsTransaction[];
  };
}

export interface WsNewOrderEvent {
  type: 'new_order';
  data: WsOrder;
}

export interface WsOrderUpdateEvent {
  type: 'order_update';
  data: WsOrderUpdate;
}

export interface WsNewDealEvent {
  type: 'new_deal';
  data: WsDeal;
}

export interface WsStatsUpdateEvent {
  type: 'stats_update';
  data: WsStats;
}

export interface WsOrdersBumpEvent {
  type: 'orders_bump';
  data: {
    orders: WsOrder[];
  };
}

export interface WsSuccessPaymentEvent {
  type: 'success_payment';
  data: {
    amount: number;
    tx_hash: string;
  };
}

export interface WsSuccessWithdrawalEvent {
  type: 'success_withdrawal';
  data: {
    amount: number;
  };
}

export type WsEvent =
  | WsInitialStateEvent
  | WsNewOrderEvent
  | WsOrderUpdateEvent
  | WsNewDealEvent
  | WsStatsUpdateEvent
  | WsOrdersBumpEvent
  | WsSuccessPaymentEvent
  | WsSuccessWithdrawalEvent;

export type DropItem = {
  id: number;
  uid: string;
  tonAmount: number;
  status?: 'bought' | 'active' | 'unavailable';
};
