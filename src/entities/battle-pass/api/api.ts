import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { BattlePassState } from './api.dto';

export const QUERY_KEYS = {
  battlePass: ['battlepass', 'me'] as const,
};

export const useBattlePass = () => {
  return useQuery({
    queryKey: QUERY_KEYS.battlePass,
    queryFn: async (): Promise<BattlePassState> => {
      const response = await api.get<BattlePassState>('/battlepass/me');
      return response.data;
    },
  });
};

export const useClaimBattlePassReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rewardId: number): Promise<void> => {
      await api.post(`/battlepass/claim/${rewardId}`);
    },
    onMutate: async (rewardId: number) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.battlePass });
      const previousBattlePass = queryClient.getQueryData<BattlePassState>(QUERY_KEYS.battlePass);
      
      queryClient.setQueryData<BattlePassState>(QUERY_KEYS.battlePass, (old) => {
        if (!old) return old;
        return {
          ...old,
          rewards: old.rewards.map((reward) =>
            reward.id === rewardId ? { ...reward, is_claimed: true } : reward
          ),
        };
      });

      return { previousBattlePass };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBattlePass) {
        queryClient.setQueryData(QUERY_KEYS.battlePass, context.previousBattlePass);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.battlePass });
    },
  });
};
