import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, CreateOrderRequest, BuyOrderRequest } from './api.dto';
import { MOCK_ORDERS } from './mock';

const QUERY_KEYS = {
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

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<Order> => {
      const response = await api.post<Order>('/order/create', data);
      return response.data;
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};

export const useBuyOrder = () => {
  return useMutation({
    mutationFn: async (data: BuyOrderRequest): Promise<void> => {
      await api.post('/order/buy', data);
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};
