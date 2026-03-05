import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type {
  BattlePassError,
  BattlePassResponse,
  BattlePassReward,
  BattlePassRewardType,
} from './api.dto';
import { AxiosError } from 'axios';

const QUERY_KEYS = {
  battlePass: ['battle-pass'] as const,
};

export const useBattlePass = () => {
  return useQuery({
    queryKey: QUERY_KEYS.battlePass,
    queryFn: async () => {
      const response = await api.get<BattlePassResponse>('/battle/me');
      return response.data;
    },
  });
};

export const useClaimBattlePassReward = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<BattlePassError>, number>({
    mutationFn: async (rewardId: number): Promise<void> => {
      await api.post(`/battle/claim/${rewardId}`, null);
    },
    //TODO: уточнить
    onError: (err) => {
      if (err.response?.data.detail === 'Reward already claimed') {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.battlePass });
      }
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
  rewardType: BattlePassRewardType;
  title: string;
  imageUrl?: string;
}

export const mapBattlePassReward = (reward: BattlePassReward): BattlePassRewardUI => {
  return {
    id: reward.id,
    level: reward.level,
    multiplier: reward.count,
    isCompleted: reward.is_claimed,
    rewardType: reward.type,
    title: reward.title,
    imageUrl: reward.type_reward,
  };
};
