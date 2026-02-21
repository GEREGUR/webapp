import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, OrderInfo, CreateOrderRequest, BuyOrderRequest } from './api.dto';
import { MOCK_ORDERS } from './mock';

export const QUERY_KEYS = {
  orders: ['orders'] as const,
  marketOrders: ['market', 'orders'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
};

export const useMarketOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.marketOrders,
    queryFn: async (): Promise<Order[]> => {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_ORDERS;
      }
      const response = await api.get<Order[]>('/order/all');
      return response.data;
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async (): Promise<Order[]> => {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_ORDERS.slice(0, 3);
      }
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<Order> => {
      const response = await api.post<Order>('/order/create', data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};

export const useBuyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BuyOrderRequest): Promise<void> => {
      await api.post('/order/buy', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};

export const useSelfBuy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number): Promise<void> => {
      await api.post(`/order/self_buy/${orderId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export interface BuyTonRequest {
  ton_amount: number;
}

export const useBuyTon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BuyTonRequest): Promise<void> => {
      await api.post('/order/buy_ton', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};
