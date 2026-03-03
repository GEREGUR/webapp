import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type {
  Order,
  CreateOrderRequest,
  BuyOrderRequest,
  OrderSettings,
  GetSelfOrdersRequest,
  OrderInfo,
} from './api.dto';
import {} from // mockOrderSettings,
// mockSelfOrders,
// mockOrderInfo,
'./mock-data';

const QUERY_KEYS = {
  orders: ['orders', 'self'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
  orderSettings: ['order', 'settings'] as const,
};

export const useOrderInfo = (orderId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.orderInfo(orderId),
    queryFn: async () => {
      //WARN: remove later
      // try {
      const response = await api.get<OrderInfo>(`/order/info/${orderId}`);
      return response.data;
      // } catch {
      //   return import.meta.env.DEV && mockOrderInfo;
      // }
    },
    enabled: orderId > 0,
  });
};

export const useSelfOrders = (params: Omit<GetSelfOrdersRequest, 'offset'>) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<Order[]>('/order/self_orders', {
        params: { ...params, offset: (pageParam - 1) * params.limit },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < params.limit) {
        return undefined;
      }
      return lastPage.length / params.limit + 1;
    },
    initialPageParam: 1,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<void> => {
      await api.post('/order/create', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
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
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export const useSelfBuyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      await api.post(`/order/self_buy/${orderId}`, null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export const useBumpOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/order/mass_bump');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export const useOrderSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.orderSettings,
    queryFn: async () => {
      // try {
      const response = await api.get<OrderSettings>('/order/setting');
      return response.data;
      // } catch (error) {
      // console.error('API Error useOrderSettings:', error);
      //WARN: remove later - return mock data on error
      // return import.meta.env.DEV && mockOrderSettings;
      // }
    },
  });
};
