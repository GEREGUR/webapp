import type { Order } from '@/entities/order/api/api.dto';
import type { WsOrder, WsStats, DropItem } from '@/entities/market/types';
import type { OrderSettings } from '@/entities/order/api/api.dto';

export const mockOrders: Order[] = [
  {
    id: 1,
    owner: {
      id: 279058397,
      avatar: '',
      name: 'George',
      username: 'georgerubailo',
    },
    initial_bp_amount: 1000,
    initial_ton_amount: 10,
    current_ton_amount: 7.5,
    status: 'PARTIAL',
    create_date: Date.now() - 86400000,
  },
  {
    id: 2,
    owner: {
      id: 279058397,
      avatar: '',
      name: 'George',
      username: 'georgerubailo',
    },
    initial_bp_amount: 500,
    initial_ton_amount: 5,
    current_ton_amount: 5,
    status: 'OPEN',
    create_date: Date.now() - 172800000,
  },
  {
    id: 3,
    owner: {
      id: 279058397,
      avatar: '',
      name: 'George',
      username: 'georgerubailo',
    },
    initial_bp_amount: 250,
    initial_ton_amount: 2.5,
    current_ton_amount: 0,
    status: 'CLOSED',
    create_date: Date.now() - 259200000,
  },
];

export const mockMarketOrders: WsOrder[] = [
  {
    id: 101,
    owner: {
      id: 123,
      avatar: '',
      name: 'Alice',
      username: 'alice_ton',
    },
    initial_bp_amount: 2000,
    initial_ton_amount: 20,
    current_ton_amount: 20,
    status: 'OPEN',
    create_date: Date.now() - 3600000,
  },
  {
    id: 102,
    owner: {
      id: 456,
      avatar: '',
      name: 'Bob',
      username: 'bob_holder',
    },
    initial_bp_amount: 1500,
    initial_ton_amount: 15,
    current_ton_amount: 12,
    status: 'PARTIAL',
    create_date: Date.now() - 7200000,
  },
  {
    id: 103,
    owner: {
      id: 789,
      avatar: '',
      name: 'Charlie',
      username: 'charlie_crypto',
    },
    initial_bp_amount: 800,
    initial_ton_amount: 8,
    current_ton_amount: 8,
    status: 'OPEN',
    create_date: Date.now() - 14400000,
  },
  {
    id: 104,
    owner: {
      id: 321,
      avatar: '',
      name: 'Diana',
      username: 'diana_trader',
    },
    initial_bp_amount: 3000,
    initial_ton_amount: 30,
    current_ton_amount: 25.5,
    status: 'PARTIAL',
    create_date: Date.now() - 21600000,
  },
  {
    id: 105,
    owner: {
      id: 654,
      avatar: '',
      name: 'Eve',
      username: 'eve_investor',
    },
    initial_bp_amount: 500,
    initial_ton_amount: 5,
    current_ton_amount: 5,
    status: 'OPEN',
    create_date: Date.now() - 28800000,
  },
  {
    id: 106,
    owner: {
      id: 987,
      avatar: '',
      name: 'Frank',
      username: 'frank_holder',
    },
    initial_bp_amount: 1200,
    initial_ton_amount: 12,
    current_ton_amount: 9,
    status: 'PARTIAL',
    create_date: Date.now() - 36000000,
  },
  {
    id: 107,
    owner: {
      id: 111,
      avatar: '',
      name: 'Grace',
      username: 'grace_deFi',
    },
    initial_bp_amount: 750,
    initial_ton_amount: 7.5,
    current_ton_amount: 7.5,
    status: 'OPEN',
    create_date: Date.now() - 43200000,
  },
];

export const mockMarketStats: WsStats = {
  total_ton: 157.5,
  total_orders: 42,
};

export const mockDropItems: DropItem[] = [
  {
    id: 1,
    uid: 'drop-1-1234567890',
    tonAmount: 5,
    status: 'bought',
  },
  {
    id: 2,
    uid: 'drop-2-1234567891',
    tonAmount: 10,
    status: 'bought',
  },
  {
    id: 3,
    uid: 'drop-3-1234567892',
    tonAmount: 2.5,
    status: 'bought',
  },
  {
    id: 4,
    uid: 'drop-4-1234567893',
    tonAmount: 7.5,
    status: 'bought',
  },
];

export const mockOrderSettings: OrderSettings = {
  rate: 0.1,
  bonus_bp: 50,
  fee_self_buy: 1,
};
