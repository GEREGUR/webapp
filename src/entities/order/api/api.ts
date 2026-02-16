import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, OrderInfo, CreateOrderRequest, BuyOrderRequest } from './api.dto';

export const QUERY_KEYS = {
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
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
