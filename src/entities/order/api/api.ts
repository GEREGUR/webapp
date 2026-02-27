import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { Order, CreateOrderRequest, BuyOrderRequest } from './api.dto';
import { marketWsService } from '@/entities/market/ws-service';
import { useProfile } from '@/entities/user';
import type { WsOrder } from '@/entities/market';

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
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest): Promise<void> => {
      await api.post('/order/create', data);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.marketOrders });

      const optimisticOrder: Order = {
        id: Date.now() * -1,
        owner: {
          id: profile?.id ?? 0,
          avatar: profile?.avatar ?? '',
          name: profile?.name ?? 'You',
          username: profile?.username ?? '',
        },
        initial_bp_amount: data.bp_amount,
        initial_ton_amount: data.bp_amount * 10,
        current_ton_amount: data.bp_amount * 10,
        status: 'OPEN',
        create_date: Date.now(),
      };

      marketWsService.addOptimisticOrder(optimisticOrder as unknown as WsOrder);

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, (old) => {
        return old ? [optimisticOrder, ...old] : [optimisticOrder];
      });

      queryClient.setQueryData<Order[]>(QUERY_KEYS.marketOrders, (old) => {
        return old ? [optimisticOrder, ...old] : [optimisticOrder];
      });

      return { optimisticOrder };
    },
    onError: (_err, _variables, context) => {
      if (context?.optimisticOrder) {
        const tempId = `optimistic_${context.optimisticOrder.id}`;
        marketWsService.removeOptimisticOrderByTempId(tempId);

        queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, (old) => {
          return old?.filter((o) => o.id !== context.optimisticOrder.id) ?? [];
        });

        queryClient.setQueryData<Order[]>(QUERY_KEYS.marketOrders, (old) => {
          return old?.filter((o) => o.id !== context.optimisticOrder.id) ?? [];
        });
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
