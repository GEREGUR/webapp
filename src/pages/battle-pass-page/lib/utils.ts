import type { BattlePassRewardUI } from '@/entities/battle-pass';
import type { BattlePassRewardType } from '@/entities/battle-pass/api/api.dto';

interface GroupedReward {
  id: string;
  rewardType: BattlePassRewardType;
  multiplier: number;
  imageUrl?: string;
  isCompleted: boolean;
}

export const mapRewards = (rewards: BattlePassRewardUI[]): GroupedReward[] => {
  const grouped = rewards.reduce(
    (acc, { rewardType, multiplier, imageUrl }) => {
      if (!acc[rewardType]) {
        acc[rewardType] = {
          id: rewardType,
          rewardType,
          multiplier: 0,
          imageUrl,
          isCompleted: true,
        };
      }
      acc[rewardType].multiplier += multiplier;
      return acc;
    },
    {} as Record<BattlePassRewardType, GroupedReward>
  );

  return Object.values(grouped);
};
