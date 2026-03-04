import { FC } from 'react';

import { getRewardIcon } from '../lib/utils';
import { cn } from '@/shared/lib/utils';
import CheckmarkIcon from '@/shared/assets/checkmark.svg?react';
import { Button } from '@/shared/ui/button';
import { BattlePassRewardUI } from '@/entities/battle-pass';

interface RewardListProps {
  currentLevel: number;
  onClaim: (reward: BattlePassRewardUI) => void;
  rewards: BattlePassRewardUI[];
}

export const RewardList: FC<RewardListProps> = ({ rewards, onClaim, currentLevel }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rewards.map((reward, index) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          canClaim={reward.level <= currentLevel}
          index={index}
          currentLevel={currentLevel}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
};

const RewardCard: FC<{
  reward: BattlePassRewardUI;
  canClaim: boolean;
  onClaim: (reward: BattlePassRewardUI) => void;
  currentLevel: number;
  index: number;
}> = ({ reward, canClaim, onClaim, index, currentLevel }) => {
  const Icon = getRewardIcon(reward.rewardType);

  return (
    <div
      className={cn(
        'bg-card-dark relative flex min-h-[219px] w-full flex-col rounded-[12px] border-[1.4px] p-[10px]',
        { 'border-green-bp': reward.isCompleted },
        index + 1 <= currentLevel ? 'border-blue-bp' : 'border-white/20'
      )}
    >
      <div className="bg-blue-bp absolute -top-[0.3px] -left-[0.3px] flex h-[38px] w-[38px] items-center justify-center rounded-[12px] p-[8px]">
        <span className="text-[29px] leading-[16.71px] font-normal text-white">{index + 1}</span>
      </div>

      <div className="mx-auto mt-[10px] flex w-full max-w-[120px] flex-1 flex-col">
        <div className="bg-ghost flex h-[116px] w-full items-center justify-center rounded-[10px]">
          <Icon className="size-[100px]" />
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-[14px] leading-[16.71px] font-medium text-white">
            X{reward.level}
          </span>
          <span
            className={`text-[14px] leading-[16.71px] font-medium text-white ${reward.rewardType === 'TON' || reward.rewardType === 'BP' ? 'uppercase' : 'capitalize'}`}
          >
            {reward.title}
          </span>
        </div>

        <div className="mt-auto flex w-full items-center justify-center">
          {reward.isCompleted ? (
            <div className="flex justify-center">
              <CheckmarkIcon />
            </div>
          ) : (
            <Button
              className={cn(
                'h-[30px] w-full max-w-[119px] rounded-[7.4px] px-[6px] py-0 text-[12px] font-medium min-[500px]:mt-2',
                canClaim
                  ? 'bg-button-bp text-white'
                  : 'cursor-not-allowed border border-white/20 bg-white/10 text-white/40'
              )}
              variant="secondary"
              disabled={!canClaim}
              onClick={() => onClaim(reward)}
            >
              Забрать награду
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
