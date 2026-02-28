import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type {
  CheckPaymentRequest,
  CheckPaymentResponse,
  PaymentData,
  WalletActionResponse,
  WithdrawRequest,
} from './api.dto';

const QUERY_KEYS = {
  paymentData: ['wallet', 'payment', 'data'] as const,
};

interface UsePaymentDataOptions {
  enabled?: boolean;
}

export const usePaymentData = (options?: UsePaymentDataOptions) => {
  return useQuery({
    queryKey: QUERY_KEYS.paymentData,
    queryFn: async (): Promise<PaymentData> => {
      const response = await api.get<PaymentData>('/wallet/payment/data');
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memo }: CheckPaymentRequest): Promise<CheckPaymentResponse> => {
      const response = await api.post<CheckPaymentResponse>('/wallet/payment/transaction', null, {
        params: { memo },
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'wallet', 'history'] });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithdrawRequest): Promise<WalletActionResponse> => {
      const response = await api.post<WalletActionResponse>('/wallet/withdrawal', data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['user', 'wallet', 'history'] });
    },
  });
};
