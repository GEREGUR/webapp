export type OrderStatus = 'OPEN' | 'PARTIAL' | 'CLOSED';

export interface OrderOwner {
  id: number;
  avatar: string;
  name: string;
  username: string;
}

export interface Order {
  id: number;
  owner: OrderOwner;
  initial_bp_amount: number;
  initial_ton_amount: number;
  current_ton_amount: number;
  status: OrderStatus;
  create_date: number;
}

export interface CreateOrderRequest {
  bp_amount: number;
}

export interface BuyOrderRequest {
  order_id: number;
  ton_amount: number;
}

export interface OrderSettings {
  rate: number;
  bonus_bp: number;
  fee_self_buy: number;
}

export interface GetSelfOrdersRequest {
  min_ton_amount: number;
  limit: number;
  offset: number;
}

export interface OrderInfo {
  id: number;
  min_buy_amount: number;
  max_buy_amount: number;
  initial_ton_amount: number;
  current_ton_amount: number;
  self_buy_ton_amount: number;
  initial_bp_amount: number;
  reward_bp_amount: number;
  created_time: number;
}
