import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, CreateOrderRequest, BuyOrderRequest } from './api.dto';

const QUERY_KEYS = {
  orders: ['orders'] as const,
  marketOrders: ['market', 'orders'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
};

export const useMarketOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.marketOrders,
    queryFn: async (): Promise<Order[]> => {
      try {
        const response = await api.get<Order[]>('/order/self_orders');
        return response.data;
      } catch (error) {
        console.error('API Error useMarketOrders:', error);
        throw error;
      }
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async (): Promise<Order[]> => {
      try {
        const response = await api.get<Order[]>('/order/self_orders');
        return response.data;
      } catch (error) {
        console.error('API Error useOrders:', error);
        throw error;
      }
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<void> => {
      await api.post('/order/create', data);
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: ['user', 'profile'] });
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
      void context.client.invalidateQueries({ queryKey: ['user', 'profile'] });
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};
