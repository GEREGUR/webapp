import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getTelegramUserData } from '@/shared/api';
import type { UserProfile } from './api.dto';

interface GetMeResponse {
  id: number;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
  is_checked_instruction: boolean;
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
          is_checked_instruction: response.data.is_checked_instruction,
          name: telegramUser?.first_name || `User #${response.data.id}`,
          username: telegramUser?.username || `user${response.data.id}`,
          avatar: telegramUser?.photo_url || '',
        };
      } catch (error) {
        console.error('API Error useProfile:', error);
        const telegramUser = getTelegramUserData();

        return {
          id: 777,
          internal_balance: 2500,
          ton_balance: 12.5,
          wallet_address: 'UQBKvZmXMockWalletAddress0123456789',
          referral_earn: 42,
          is_checked_instruction: true,
          name: telegramUser?.first_name || 'Mock Player',
          username: telegramUser?.username || 'mock_player',
          avatar: telegramUser?.photo_url || '',
        };
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

export const useSetInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/user/set_instruction', null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};
