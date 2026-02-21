import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, OrderInfo, CreateOrderRequest, BuyOrderRequest } from './api.dto';

export const QUERY_KEYS = {
  orders: ['orders'] as const,
  marketOrders: ['market', 'orders'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
};

export const useMarketOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.marketOrders,
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get<Order[]>('/order/all');
      return response.data;
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get<Order[]>('/order/my');
      return response.data;
    },
  });
};

export const useOrderInfo = (orderId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.orderInfo(orderId),
    queryFn: async (): Promise<OrderInfo> => {
      const response = await api.get<OrderInfo>(`/order/info/${orderId}`);
      return response.data;
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<Order> => {
      const response = await api.post<Order>('/order/create', data);
      return response.data;
    },
  });
};

export const useBuyOrder = () => {
  return useMutation({
    mutationFn: async (data: BuyOrderRequest): Promise<void> => {
      await api.post('/order/buy', data);
    },
  });
};

export const useSelfBuy = () => {
  return useMutation({
    mutationFn: async (orderId: number): Promise<void> => {
      await api.post(`/order/self_buy/${orderId}`);
    },
  });
};

export interface BuyTonRequest {
  ton_amount: number;
}

export const useBuyTon = () => {
  return useMutation({
    mutationFn: async (data: BuyTonRequest): Promise<void> => {
      await api.post('/order/buy_ton', data);
    },
  });
};
