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
      const response = await api.get<BattlePassResponse>('/battle/me');
      return response.data;
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
    imageUrl: reward.type_image_url,
  };
};
