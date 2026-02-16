import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { PaymentData, WithdrawalRequest } from './api.dto';

export const QUERY_KEYS = {
  paymentData: ['wallet', 'payment', 'data'] as const,
};

export const usePaymentData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.paymentData,
    queryFn: async (): Promise<PaymentData> => {
      const response = await api.get<PaymentData>('/wallet/payment/data');
      return response.data;
    },
  });
};

export const useCheckTransaction = () => {
  return useMutation({
    mutationFn: async (memo: string): Promise<void> => {
      await api.post('/wallet/payment/transaction', null, {
        params: { memo },
      });
    },
  });
};

export const useWithdraw = () => {
  return useMutation({
    mutationFn: async (data: WithdrawalRequest): Promise<void> => {
      await api.post('/wallet/withdrawal', data);
    },
  });
};
