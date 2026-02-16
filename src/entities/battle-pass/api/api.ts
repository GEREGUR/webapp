import { api } from '@/shared/api';
import type { BattlePassState } from './api.dto';

export const battlePassApi = {
  // Get battle pass state
  getBattlePass: async (): Promise<BattlePassState> => {
    const response = await api.get<BattlePassState>('/battlepass/me');
    return response.data;
  },

  // Claim reward
  claimReward: async (rewardId: number): Promise<void> => {
    await api.post(`/battlepass/claim/${rewardId}`);
  },
};
