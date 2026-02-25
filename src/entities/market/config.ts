import type { DropItem } from './types';

export const MAX_ITEMS = 15;
export const RECONNECT_DELAY_MS = 3000;
export const MAX_RETRY_COUNT = 2;
export const FALLBACK_TIMEOUT_MS = 3000;

export const WS_PATH = '/api/v1/socket/ws';

export const MOCK_LIVE_ITEMS: DropItem[] = [
  { id: 1, uid: 'mock-1', tonAmount: 0.5, status: 'bought' },
  { id: 2, uid: 'mock-2', tonAmount: 1.2, status: 'bought' },
  { id: 3, uid: 'mock-3', tonAmount: 0.8, status: 'bought' },
  { id: 4, uid: 'mock-4', tonAmount: 2.5, status: 'bought' },
  { id: 5, uid: 'mock-5', tonAmount: 1.8, status: 'bought' },
];
