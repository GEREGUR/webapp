import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { BattlePassResponse, BattlePassReward } from './api.dto';

const QUERY_KEYS = {
  battlePass: ['battle-pass'] as const,
};

export const useBattlePass = () => {
  return useQuery({
    queryKey: QUERY_KEYS.battlePass,
    queryFn: async (): Promise<BattlePassResponse> => {
      try {
        const response = await api.get<BattlePassResponse>('/battle/me');
        return response.data;
      } catch (error) {
        console.error('API Error useBattlePass:', error);
        return {
          level: 4,
          exp: 420,
          progress: 84,
          is_active: true,
          rewards: [
            {
              id: 101,
              level: 1,
              type: 'BP',
              count: 100,
              title: 'BP Points',
              is_claimed: true,
              is_available: true,
              type_reward: '',
            },
            {
              id: 102,
              level: 2,
              type: 'TON',
              count: 1,
              title: 'TON Reward',
              is_claimed: true,
              is_available: true,
              type_reward: '',
            },
            {
              id: 103,
              level: 3,
              type: 'BP',
              count: 250,
              title: 'BP Points',
              is_claimed: false,
              is_available: true,
              type_reward: '',
            },
            {
              id: 104,
              level: 4,
              type: 'TON',
              count: 3,
              title: 'TON Reward',
              is_claimed: false,
              is_available: true,
              type_reward: '',
            },
            {
              id: 105,
              level: 5,
              type: 'BP',
              count: 500,
              title: 'BP Points',
              is_claimed: false,
              is_available: false,
              type_reward: '',
            },
            {
              id: 106,
              level: 6,
              type: 'TON',
              count: 5,
              title: 'TON Reward',
              is_claimed: false,
              is_available: false,
              type_reward: '',
            },
          ],
        };
      }
    },
    retry: false,
  });
};

export const useActivateBattlePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/battle/activate', null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.battlePass });
    },
  });
};

export const useClaimBattlePassReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: number): Promise<void> => {
      await api.post(`/battle/claim/${rewardId}`, null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.battlePass });
    },
  });
};

export interface BattlePassRewardUI {
  id: number;
  level: number;
  multiplier: number;
  isCompleted: boolean;
  rewardType: 'bp' | 'ton';
  imageUrl?: string;
}

export const mapBattlePassReward = (reward: BattlePassReward): BattlePassRewardUI => {
  const isTon = reward.type === 'TON';

  return {
    id: reward.id,
    level: reward.level,
    multiplier: reward.count,
    isCompleted: reward.is_claimed,
    rewardType: isTon ? 'ton' : 'bp',
    imageUrl: reward.type_reward,
  };
};
