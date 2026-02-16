import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { UserProfile, WalletHistoryResponse } from './api.dto';

export const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  walletHistory: ['user', 'wallet', 'history'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/user/me');
      return response.data;
    },
  });
};

export const useWalletHistory = (offset = 0, limit = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.walletHistory, offset, limit],
    queryFn: async (): Promise<WalletHistoryResponse> => {
      const response = await api.get<WalletHistoryResponse>('/user/wallet/history', {
        params: { offset, limit },
      });
      return response.data;
    },
  });
};

export const useBindWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: string): Promise<void> => {
      await api.post(`/user/wallet/${address}`);
    },
    onMutate: async (address: string) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile });
      const previousProfile = queryClient.getQueryData<UserProfile>(QUERY_KEYS.profile);
      
      queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile, (old) => {
        if (!old) return old;
        return { ...old, wallet_address: address };
      });

      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(QUERY_KEYS.profile, context.previousProfile);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};

export const useClearWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/user/wallet/clear');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile });
      const previousProfile = queryClient.getQueryData<UserProfile>(QUERY_KEYS.profile);
      
      queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile, (old) => {
        if (!old) return old;
        return { ...old, wallet_address: null };
      });

      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(QUERY_KEYS.profile, context.previousProfile);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};
