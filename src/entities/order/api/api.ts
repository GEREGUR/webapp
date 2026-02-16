import { api } from '@/shared/api';
import type { Order, OrderInfo, CreateOrderRequest, BuyOrderRequest } from './api.dto';

export const orderApi = {
  // Create order (sell BP)
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/order/create', data);
    return response.data;
  },

  // Buy order (buy BP with TON)
  buyOrder: async (data: BuyOrderRequest): Promise<void> => {
    await api.post('/order/buy', data);
  },

  // Self buy (cancel order)
  selfBuy: async (orderId: number): Promise<void> => {
    await api.post(`/order/self_buy/${orderId}`);
  },

  // Get order info
  getOrderInfo: async (orderId: number): Promise<OrderInfo> => {
    const response = await api.get<OrderInfo>(`/order/info/${orderId}`);
    return response.data;
  },
};
