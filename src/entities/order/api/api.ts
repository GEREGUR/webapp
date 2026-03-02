import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, CreateOrderRequest, BuyOrderRequest, OrderSettings } from './api.dto';
import { marketWsService } from '@/entities/market/ws-service';

const QUERY_KEYS = {
  orders: ['orders', 'left'] as const,
  marketOrders: ['market', 'orders'] as const,
  orderInfo: (orderId: number) => ['order', 'info', orderId] as const,
  orderSettings: ['order', 'settings'] as const,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<void> => {
      await api.post('/order/create', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.marketOrders });

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);
      const previousMarketOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.marketOrders);

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

      queryClient.setQueryData<Order[]>(QUERY_KEYS.marketOrders, (old) => {
        return old?.filter((order) => order.id !== data.order_id) ?? [];
      });

      return { previousOrders, previousMarketOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }
      if (context?.previousMarketOrders) {
        queryClient.setQueryData(QUERY_KEYS.marketOrders, context.previousMarketOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
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
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.marketOrders });

      marketWsService.bumpOrder(orderId);

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);
      const previousMarketOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.marketOrders);

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
      queryClient.setQueryData<Order[]>(QUERY_KEYS.marketOrders, updateOrdersList);

      return { previousOrders, previousMarketOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }
      if (context?.previousMarketOrders) {
        queryClient.setQueryData(QUERY_KEYS.marketOrders, context.previousMarketOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
  });
};

export const useBumpOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/order/mass_bump', null);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.marketOrders });

      const previousOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);
      const previousMarketOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.marketOrders);

      const updateOrdersList = (orders: Order[] | undefined) => {
        if (!orders || orders.length === 0) return orders;
        const sortedOrders = [...orders].sort((a, b) => b.create_date - a.create_date);
        return sortedOrders;
      };

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, updateOrdersList);
      queryClient.setQueryData<Order[]>(QUERY_KEYS.marketOrders, updateOrdersList);

      return { previousOrders, previousMarketOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(QUERY_KEYS.orders, context.previousOrders);
      }
      if (context?.previousMarketOrders) {
        queryClient.setQueryData(QUERY_KEYS.marketOrders, context.previousMarketOrders);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketOrders });
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
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
