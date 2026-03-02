import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type {
  Order,
  CreateOrderRequest,
  BuyOrderRequest,
  OrderSettings,
  GetSelfOrdersRequest,
} from './api.dto';
import { marketWsService } from '@/entities/market/ws-service';

const QUERY_KEYS = {
  orders: ['orders', 'self'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
  orderSettings: ['order', 'settings'] as const,
};

export const useSelfOrders = (params: Omit<GetSelfOrdersRequest, 'offset'>) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async ({ pageParam }): Promise<Order[]> => {
      try {
        const response = await api.get<Order[]>('/order/self_orders', {
          params: { ...params, offset: (pageParam - 1) * params.limit },
        });
        return response.data;
      } catch (error) {
        console.error('API Error useOrders:', error);

        throw error;
      }
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, (old) => {
        return old?.map((order) => {
          if (order.id === data.order_id) {
            return {
              ...order,
              status: 'CLOSED' as const,
              current_ton_amount: 0,
            };
          }
          return order;
        });
      });

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
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
    mutationFn: async (orderId: number): Promise<void> => {
      await api.post(`/order/self_buy/${orderId}`, null);
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, (old) => {
        return old?.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'CLOSED' as const,
              current_ton_amount: 0,
            };
          }
          return order;
        });
      });

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
};

export const useBumpOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number): Promise<void> => {
      await api.post(`/order/bump/${orderId}`, null);
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });

      marketWsService.bumpOrder(orderId);

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);

      const updateOrdersList = (orders: Order[] | undefined) => {
        if (!orders) return orders;
        const orderIndex = orders.findIndex((o) => o.id === orderId);
        if (orderIndex > 0) {
          const updatedOrders = [...orders];
          const [order] = updatedOrders.splice(orderIndex, 1);
          updatedOrders.unshift(order);
          return updatedOrders;
        }
        return orders;
      };

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, updateOrdersList);

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
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
    mutationFn: async (): Promise<void> => {
      await api.post('/order/mass_bump');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);

      const updateOrdersList = (orders: Order[] | undefined) => {
        if (!orders || orders.length === 0) return orders;
        const sortedOrders = [...orders].sort((a, b) => b.create_date - a.create_date);
        return sortedOrders;
      };

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, updateOrdersList);

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }

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
    queryFn: async (): Promise<OrderSettings> => {
      try {
        const response = await api.get<OrderSettings>('/order/setting');
        return response.data;
      } catch (error) {
        console.error('API Error useOrderSettings:', error);
        if (import.meta.env.DEV) {
          return {
            rate: 0.1,
            bonus_bp: 50,
            fee_self_buy: 1,
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
