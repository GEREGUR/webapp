import type { WsOrder, WsStats, DropItem, WsOrderOwner } from './types';

const mockOwners: WsOrderOwner[] = [
  { id: 1, avatar: 'https://t.me/i/userpic/320/avatar1.jpg', name: 'Alice', username: 'alice' },
  { id: 2, avatar: 'https://t.me/i/userpic/320/avatar2.jpg', name: 'Bob', username: 'bob' },
  { id: 3, avatar: 'https://t.me/i/userpic/320/avatar3.jpg', name: 'Charlie', username: 'charlie' },
  { id: 4, avatar: 'https://t.me/i/userpic/320/avatar4.jpg', name: 'David', username: 'david' },
  { id: 5, avatar: 'https://t.me/i/userpic/320/avatar5.jpg', name: 'Eve', username: 'eve' },
];

export const mockOrders: WsOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: 1000 + i,
  owner: mockOwners[i % mockOwners.length],
  initial_bp_amount: 1000 + i * 100,
  initial_ton_amount: 10 + i * 0.5,
  current_ton_amount: 10 + i * 0.5,
  status: i % 3 === 0 ? 'CLOSED' : i % 2 === 0 ? 'PARTIAL' : 'OPEN',
  create_date: Date.now() - (20 - i) * 60000,
}));

export const mockStats: WsStats = {
  total_ton: 1250.5,
  total_orders: 156,
};

export const mockItems: DropItem[] = [
  { id: 1, uid: 'tx_1_0', tonAmount: 25.5, status: 'bought' },
  { id: 2, uid: 'tx_2_1', tonAmount: 18.3, status: 'bought' },
  { id: 3, uid: 'tx_3_2', tonAmount: 12.7, status: 'active' },
  { id: 4, uid: 'deal_4_0', tonAmount: 30.0, status: 'bought' },
  { id: 5, uid: 'tx_5_4', tonAmount: 8.9, status: 'bought' },
];
