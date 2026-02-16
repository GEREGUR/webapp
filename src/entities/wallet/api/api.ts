import { api } from '@/shared/api';
import type { PaymentData, WithdrawalRequest } from './api.dto';

export const walletApi = {
  // Get payment data for deposit
  getPaymentData: async (): Promise<PaymentData> => {
    const response = await api.get<PaymentData>('/wallet/payment/data');
    return response.data;
  },

  // Check transaction status
  checkTransaction: async (memo: string): Promise<void> => {
    await api.post('/wallet/payment/transaction', null, {
      params: { memo },
    });
  },

  // Withdraw TON
  withdraw: async (data: WithdrawalRequest): Promise<void> => {
    await api.post('/wallet/withdrawal', data);
  },
};
