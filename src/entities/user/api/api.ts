import { useQuery, useMutation } from '@tanstack/react-query';
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

const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  walletHistory: ['user', 'wallet', 'history'] as const,
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
  });
};

export const useWalletHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.walletHistory,
    queryFn: async (): Promise<WalletHistoryItem[]> => {
      try {
        const response = await api.get<GetWalletHistoryResponse>('/wallet/history');
        return response.data.history;
      } catch (error) {
        console.error('API Error useWalletHistory:', error);
        throw error;
      }
    },
  });
};

export const useWithdraw = () => {
  return useMutation({
    mutationFn: async (data: WithdrawRequest): Promise<void> => {
      await api.post('/wallet/withdrawal', data);
    },
  });
};

export const useSetWallet = () => {
  return useMutation({
    mutationFn: async (data: SetWalletRequest): Promise<void> => {
      await api.post(`/user/wallet/${data.address}`, null);
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};

export const useClearWallet = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/user/wallet/clear', null);
    },
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};
