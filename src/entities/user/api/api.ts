import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getTelegramUserData } from '@/shared/api';
import type { UserProfile } from './api.dto';

interface GetMeResponse {
  id: number;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
}

interface WalletHistoryItem {
  id: number;
  currency: 'TON' | 'BP';
  amount: number;
  title: string;
  date: string;
}

interface GetWalletHistoryResponse {
  history: WalletHistoryItem[];
}

interface WithdrawRequest {
  amount: number;
  address: string;
}

interface SetWalletRequest {
  address: string;
}

interface PaymentData {
  address: string;
  memo: string;
  min_ton_amount: number;
}

const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  walletHistory: ['user', 'wallet', 'history'] as const,
  paymentData: ['user', 'wallet', 'payment'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async (): Promise<UserProfile> => {
      try {
        const response = await api.get<GetMeResponse>('/user/me');
        const telegramUser = getTelegramUserData();

        return {
          ...response.data,
          name: telegramUser?.first_name || `User #${response.data.id}`,
          username: telegramUser?.username || `user${response.data.id}`,
          avatar: telegramUser?.photo_url || '',
        };
      } catch (error) {
        console.error('API Error useProfile:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useWalletHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.walletHistory,
    queryFn: async (): Promise<WalletHistoryItem[]> => {
      try {
        const response = await api.get<GetWalletHistoryResponse>('/user/wallet/history');
        return response.data.history;
      } catch (error) {
        console.error('API Error useWalletHistory:', error);
        throw error;
      }
    },
  });
};

export const usePaymentData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.paymentData,
    queryFn: async (): Promise<PaymentData> => {
      const response = await api.get<PaymentData>('/wallet/payment/data');
      return response.data;
    },
    staleTime: Infinity,
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithdrawRequest): Promise<void> => {
      await api.post('/wallet/withdrawal', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletHistory });
    },
  });
};

export const useSetWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetWalletRequest): Promise<void> => {
      await api.post(`/user/wallet/${data.address}`, null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};

export const useClearWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/user/wallet/clear', null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};
