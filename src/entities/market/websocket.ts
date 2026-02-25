import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { WS_PATH } from './config';
import type { WsDeal, WsOrder, WsOrderUpdate, WsStats, WsTransaction, WsEvent } from './types';

export const getWsUrl = (): string | null => {
  const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
  const proxyTarget = import.meta.env.VITE_PROXY_TARGET as string | undefined;
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const fallbackUrl = window.location.origin;
  const sourceUrl =
    apiBaseUrl && /^https?:\/\//.test(apiBaseUrl)
      ? apiBaseUrl
      : proxyTarget && /^https?:\/\//.test(proxyTarget)
        ? proxyTarget
        : apiBaseUrl || fallbackUrl;

  let parsedApiUrl: URL;
  try {
    parsedApiUrl = new URL(sourceUrl, fallbackUrl);
  } catch {
    return null;
  }

  let wsHost: string;
  if (wsUrl) {
    try {
      const parsedWsUrl = new URL(wsUrl);
      wsHost = parsedWsUrl.host;
    } catch {
      wsHost = parsedApiUrl.host;
    }
  } else {
    wsHost = parsedApiUrl.host;
  }

  const socketUrl = new URL(`wss://${wsHost}`);
  socketUrl.pathname = WS_PATH;

  try {
    const initData = retrieveLaunchParams();
    if (initData?.tgWebAppData?.user?.id) {
      socketUrl.searchParams.set('auth', initData.tgWebAppData.user.id.toString());
    }
  } catch {
    // Telegram SDK not ready yet
  }

  return socketUrl.toString();
};

const isWsDeal = (value: unknown): value is WsDeal => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const deal = value as WsDeal;
  return typeof deal.order_id === 'number' && typeof deal.ton_amount === 'number';
};

export const isWsOrder = (value: unknown): value is WsOrder => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const order = value as WsOrder;
  return (
    typeof order.id === 'number' &&
    typeof order.initial_bp_amount === 'number' &&
    typeof order.initial_ton_amount === 'number' &&
    typeof order.current_ton_amount === 'number' &&
    typeof order.status === 'string' &&
    typeof order.create_date === 'number' &&
    order.owner !== undefined
  );
};

export const isWsOrderUpdate = (value: unknown): value is WsOrderUpdate => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const update = value as WsOrderUpdate;
  return (
    typeof update.id === 'number' &&
    typeof update.current_ton_amount === 'number' &&
    (update.status === 'PARTIAL' || update.status === 'CLOSED')
  );
};

export const isWsStats = (value: unknown): value is WsStats => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Record<string, unknown>;
  const totalTon = stats.total_ton;
  const totalOrders = stats.total_orders ?? stats.totaR_orders;
  return typeof totalTon === 'number' && typeof totalOrders === 'number';
};

export const isWsTransaction = (value: unknown): value is WsTransaction => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tx = value as WsTransaction;
  return (
    typeof tx.id === 'number' &&
    typeof tx.type === 'string' &&
    typeof tx.currency === 'string' &&
    typeof tx.value === 'number' &&
    typeof tx.create_date === 'number'
  );
};

export const parseWsEvent = (rawMessage: string): WsEvent | null => {
  let payload: unknown;
  try {
    payload = JSON.parse(rawMessage);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const event = payload as { type?: unknown; data?: unknown };

  if (event.type === 'new_deal' && isWsDeal(event.data)) {
    return {
      type: 'new_deal',
      data: event.data,
    };
  }

  if (event.type === 'initial_state' && event.data && typeof event.data === 'object') {
    const initialState = event.data as {
      stats?: unknown;
      orders?: unknown;
      history?: unknown;
    };

    const stats =
      initialState.stats && isWsStats(initialState.stats) ? initialState.stats : undefined;
    const orders = Array.isArray(initialState.orders)
      ? initialState.orders.filter(isWsOrder)
      : undefined;
    const history = Array.isArray(initialState.history)
      ? initialState.history.filter(isWsTransaction)
      : undefined;

    return {
      type: 'initial_state',
      data: { stats, orders, history },
    };
  }

  if (event.type === 'new_order' && isWsOrder(event.data)) {
    return {
      type: 'new_order',
      data: event.data,
    };
  }

  if (event.type === 'order_update' && isWsOrderUpdate(event.data)) {
    return {
      type: 'order_update',
      data: event.data,
    };
  }

  if (event.type === 'stats_update' && isWsStats(event.data)) {
    return {
      type: 'stats_update',
      data: event.data,
    };
  }

  if (event.type === 'orders_bump' && event.data && typeof event.data === 'object') {
    const bumpData = event.data as { orders?: unknown };
    if (Array.isArray(bumpData.orders)) {
      return {
        type: 'orders_bump',
        data: { orders: bumpData.orders.filter(isWsOrder) },
      };
    }
  }

  if (event.type === 'success_payment' && event.data && typeof event.data === 'object') {
    const paymentData = event.data as { amount?: unknown; tx_hash?: unknown };
    if (typeof paymentData.amount === 'number' && typeof paymentData.tx_hash === 'string') {
      return {
        type: 'success_payment',
        data: { amount: paymentData.amount, tx_hash: paymentData.tx_hash },
      };
    }
  }

  if (event.type === 'success_withdrawal' && event.data && typeof event.data === 'object') {
    const withdrawalData = event.data as { amount?: unknown };
    if (typeof withdrawalData.amount === 'number') {
      return {
        type: 'success_withdrawal',
        data: { amount: withdrawalData.amount },
      };
    }
  }

  return null;
};
