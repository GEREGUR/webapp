import type { Order, OrderSettings, OrderInfo } from './api.dto';

export const mockOrderSettings: OrderSettings = {
  rate: 5,
  bonus_bp: 100,
  fee_self_buy: 0.5,
};

const mockOwners = [
  { id: 1, avatar: 'https://t.me/i/userpic/320/avatar1.jpg', name: 'Alice', username: 'alice' },
  { id: 2, avatar: 'https://t.me/i/userpic/320/avatar2.jpg', name: 'Bob', username: 'bob' },
  { id: 3, avatar: 'https://t.me/i/userpic/320/avatar3.jpg', name: 'Charlie', username: 'charlie' },
];

export const mockSelfOrders: Order[] = Array.from({ length: 10 }, (_, i) => ({
  id: 2000 + i,
  owner: mockOwners[i % mockOwners.length],
  initial_bp_amount: 500 + i * 50,
  initial_ton_amount: 5 + i * 0.3,
  current_ton_amount: 5 + i * 0.3 - (i % 3) * 0.5,
  status: i % 4 === 0 ? 'CLOSED' : i % 2 === 0 ? 'PARTIAL' : 'OPEN',
  create_date: Date.now() - (10 - i) * 120000,
}));

export const mockOrderInfo: OrderInfo = {
  id: 1001,
  min_buy_amount: 1,
  max_buy_amount: 10,
  initial_ton_amount: 15.5,
  current_ton_amount: 12.3,
  self_buy_ton_amount: 7.2,
  initial_bp_amount: 1500,
  reward_bp_amount: 75,
  created_time: Date.now() - 3600000,
};
