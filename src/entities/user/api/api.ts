import { api } from '@/shared/api';
import type { UserProfile, WalletHistoryResponse } from './api.dto';

export const userApi = {
  // Get user profile with balances
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/user/me');
    return response.data;
  },

  // Bind wallet address
  bindWallet: async (address: string): Promise<void> => {
    await api.post(`/user/wallet/${address}`);
  },

  // Clear wallet
  clearWallet: async (): Promise<void> => {
    await api.post('/user/wallet/clear');
  },

  // Get wallet transaction history
  getWalletHistory: async (offset = 0, limit = 10): Promise<WalletHistoryResponse> => {
    const response = await api.get<WalletHistoryResponse>('/user/wallet/history', {
      params: { offset, limit },
    });
    return response.data;
  },
};
