import type { BattlePassRewardUI } from '@/entities/battle-pass';
import type { BattlePassRewardType } from '@/entities/battle-pass/api/api.dto';

import StarsIcon from '@/shared/assets/tg-star.svg?react';
import BpPointsIcon from '@/shared/assets/bp-points.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';

interface GroupedReward {
  id: string;
  rewardType: BattlePassRewardType;
  multiplier: number;
  imageUrl?: string;
  isCompleted: boolean;
  icon: React.ComponentType<React.SVGProps<SVGElement>>;
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
          icon: getRewardIcon(rewardType),
        };
      }
      acc[rewardType].multiplier += multiplier;
      return acc;
    },
    {} as Record<BattlePassRewardType, GroupedReward>
  );

  return Object.values(grouped);
};

export const getRewardIcon = (
  rewardType: BattlePassRewardType
): React.ComponentType<React.SVGProps<SVGElement>> => {
  switch (rewardType) {
    case 'STARS':
      return StarsIcon;
    case 'BP':
      return BpPointsIcon;
    case 'TON':
      return TonIcon;
    default:
      return BpPointsIcon;
  }
};
