import { type FC } from 'react';
import { Page } from '@/pages/page';
import { BattlePassProgress, useBattlePassProgress } from '@/features/battle-pass-progress';
import { BattlePassPromoCard } from '@/features/battle-pass-promo';
import BpPointsIcon from '@/shared/assets/bp-points.svg?react';
import CheckmarkIcon from '@/shared/assets/checkmark.svg?react';
import TomCatIcon from '@/shared/assets/tom-cat.png';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export interface BattlePassReward {
  id: number;
  level: number;
  multiplier: number;
  isCompleted: boolean;
  rewardType: 'brick' | 'bp';
}

const REWARDS: BattlePassReward[] = [
  { id: 1, level: 1, multiplier: 100, isCompleted: true, rewardType: 'brick' },
  { id: 2, level: 2, multiplier: 150, isCompleted: true, rewardType: 'bp' },
  { id: 3, level: 3, multiplier: 200, isCompleted: true, rewardType: 'brick' },
  { id: 4, level: 4, multiplier: 250, isCompleted: false, rewardType: 'bp' },
  { id: 5, level: 5, multiplier: 300, isCompleted: false, rewardType: 'brick' },
  { id: 6, level: 6, multiplier: 350, isCompleted: false, rewardType: 'bp' },
  { id: 7, level: 7, multiplier: 400, isCompleted: false, rewardType: 'brick' },
  { id: 8, level: 8, multiplier: 450, isCompleted: false, rewardType: 'bp' },
  { id: 9, level: 9, multiplier: 500, isCompleted: false, rewardType: 'brick' },
  { id: 10, level: 10, multiplier: 550, isCompleted: false, rewardType: 'bp' },
];

interface RewardCardProps {
  reward: BattlePassReward;
}

const RewardCard: FC<RewardCardProps> = ({ reward }) => {
  return (
    <div
      className={cn(
        'bg-card-dark relative flex h-[219px] w-[172px] flex-col rounded-[12px] border-[1px] p-[10px]',
        reward.isCompleted ? 'border-green-bp' : 'border-blue-bp'
      )}
    >
      <div className="bg-blue-bp absolute top-0 left-0 flex h-[38px] w-[38px] items-center justify-center rounded-[12px] p-[8px]">
        <span className="font-[SF_Pro_Display] text-[14px] leading-[16.71px] font-medium text-white">
          {reward.level}
        </span>
      </div>

      <div className="bg-ghost mt-[10px] flex h-[116px] w-[119px] items-center justify-center self-center rounded-[10px]">
        {reward.rewardType === 'brick' ? (
          <img src={TomCatIcon} alt="Brick" className="h-[100px] w-[100px]" />
        ) : (
          <BpPointsIcon className="text-secondary h-[100px] w-[100px]" />
        )}
      </div>

      <div className="mt-[10px] flex items-center justify-between">
        <span className="font-[SF_Pro_Display] text-[14px] leading-[16.71px] font-medium text-white">
          x{reward.multiplier}
        </span>
        <span className="font-[SF_Pro_Display] text-[14px] leading-[16.71px] font-medium text-white">
          {reward.rewardType === 'brick' ? 'Brick' : 'BP'}
        </span>
      </div>

      <div className="mt-auto">
        {reward.isCompleted ? (
          <div className="flex justify-center">
            <CheckmarkIcon />
          </div>
        ) : (
          <Button
            className="bg-button-bp h-[30px] w-full rounded-[7.4px] px-[10px] py-0 text-[12px] font-medium text-white"
            variant="secondary"
          >
            Забрать награду
          </Button>
        )}
      </div>
    </div>
  );
};

interface BattlePassPageProps {
  currentLevel?: number;
  nextLevel?: number;
  progress?: number;
  rewards?: BattlePassReward[];
}

export const BattlePassPage: FC<BattlePassPageProps> = ({
  currentLevel = 5,
  nextLevel = 6,
  progress = 65,
  rewards = REWARDS,
}) => {
  const {
    currentLevel: level,
    nextLevel: next,
    progress: percent,
    currentExp,
  } = useBattlePassProgress({
    currentLevel,
    nextLevel,
    progress,
  });

  return (
    <Page back>
      <div className="flex flex-col gap-[20px]">
        <BattlePassPromoCard />

        <BattlePassProgress
          currentLevel={level}
          nextLevel={next}
          progress={percent}
          currentExp={currentExp}
        />

        <div className="grid grid-cols-2 gap-[10px]">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>
    </Page>
  );
};
