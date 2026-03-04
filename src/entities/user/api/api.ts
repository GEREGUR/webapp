import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getTelegramUserData } from '@/shared/api';
import type { UserProfile } from './api.dto';
import { mapWalletHistoryItem } from '../lib/mappers';

interface GetMeResponse {
  id: number;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
  is_checked_instruction: boolean;
}

export type WalletHistoryType =
  | 'CREATE_ORDER'
  | 'BUY_ORDER'
  | 'BUY_ORDER_OTHER_USER'
  | 'REFERRAL'
  | 'PAYMENT'
  | 'WITHDRAWAL'
  | 'BATTLE_PASS';

export interface WalletHistoryApiItem {
  id: number;
  type: WalletHistoryType;
  currency: 'TON' | 'BP';
  value: number;
  obj_id: number | null;
  create_date: number;
}

type GetWalletHistoryResponse = WalletHistoryApiItem[];

export interface WalletHistoryItem {
  id: number;
  currency: 'TON' | 'BP';
  amount: number;
  title: string;
  date: string;
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
      const response = await api.get<GetMeResponse>('/user/me');
      const telegramUser = getTelegramUserData();

      return {
        ...response.data,
        is_checked_instruction: response.data.is_checked_instruction,
        name: telegramUser?.first_name || `User #${response.data.id}`,
        username: telegramUser?.username || `user${response.data.id}`,
        avatar: telegramUser?.photo_url || '',
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useWalletHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.walletHistory,
    queryFn: async (): Promise<WalletHistoryItem[]> => {
      const response = await api.get<GetWalletHistoryResponse>('/user/wallet/history');

      return response.data.map(mapWalletHistoryItem);
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
