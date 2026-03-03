import { type FC, useEffect, useMemo, useState } from 'react';
import { Page } from '@/pages/page';
import { BattlePassProgress } from '@/features/battle-pass-progress';
import { BattlePassPromoCard } from '@/features/battle-pass-promo';
import {
  useBattlePass,
  useClaimBattlePassReward,
  useActivateBattlePass,
  mapBattlePassReward,
  type BattlePassRewardUI,
} from '@/entities/battle-pass';
import BpPointsIcon from '@/shared/assets/bp-points.svg?react';
import CheckmarkIcon from '@/shared/assets/checkmark.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import PepeGiftIcon from '@/shared/assets/pepe-gift.png';
import { useToast } from '@/shared/ui/toast';
import { Loader } from '@/shared/ui/spinner';
import { X } from 'lucide-react';
import { useProfile } from '@/entities/user';
import { mapRewards } from './lib/utils';
const isValidUrl = (url: unknown): url is string => {
  return typeof url === 'string' && url.length > 0;
};

const RewardCard: FC<{
  reward: BattlePassRewardUI;
  canClaim: boolean;
  onClaim: (reward: BattlePassRewardUI) => void;
  currentLevel: number;
  index: number;
}> = ({ reward, canClaim, onClaim, index, currentLevel }) => {
  const getImage = () => {
    if (isValidUrl(reward.imageUrl)) {
      return (
        <img
          src={reward.imageUrl}
          alt={reward.rewardType}
          className="h-[100px] w-[100px] object-contain"
        />
      );
    }

    if (reward.rewardType === 'TON') {
      return <TonIcon className="h-[100px] w-[100px]" />;
    }

    return <BpPointsIcon className="text-secondary h-[100px] w-[100px]" />;
  };

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
          {getImage()}
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-[14px] leading-[16.71px] font-medium text-white">
            X{reward.level}
          </span>
          <span
            className={`text-[14px] leading-[16.71px] font-medium text-white ${reward.rewardType === 'TON' || reward.rewardType === 'BP' ? 'uppercase' : 'capitalize'}`}
          >
            {reward.rewardType}
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

interface ClaimOverlayProps {
  open: boolean;
  rewards: BattlePassRewardUI[];
  onClose: () => void;
}

const ClaimOverlay: FC<ClaimOverlayProps> = ({ open, rewards, onClose }) => {
  const isScrollable = rewards.length > 9;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[10000] w-full bg-[#5F81D8] p-4 pb-[150px]',
        isScrollable ? 'overflow-y-auto' : 'overflow-hidden'
      )}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'conic-gradient(from -92deg at 50% 17%, rgba(255,255,255,0.26) 0deg 19deg, rgba(255,255,255,0.05) 19deg 42deg, rgba(255,255,255,0.23) 42deg 74deg, rgba(255,255,255,0.06) 74deg 95deg, rgba(255,255,255,0.2) 95deg 131deg, rgba(255,255,255,0.04) 131deg 152deg, rgba(255,255,255,0.22) 152deg 188deg, rgba(255,255,255,0.05) 188deg 214deg, rgba(255,255,255,0.24) 214deg 247deg, rgba(255,255,255,0.06) 247deg 271deg, rgba(255,255,255,0.2) 271deg 309deg, rgba(255,255,255,0.05) 309deg 334deg, rgba(255,255,255,0.24) 334deg 360deg)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 27%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0) 100%)',
          maskImage:
            'radial-gradient(circle at 50% 27%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_27%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_33%,rgba(255,255,255,0)_68%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[370px]">
        <div>
          <div className="mb-2 flex items-center justify-center">
            <h2 className="text-[38px] leading-none font-medium text-white/95">Батлпасс</h2>
            <button
              type="button"
              className="absolute top-0 right-0 rounded-md p-1 text-white/90 transition hover:bg-white/10 hover:text-white"
              onClick={onClose}
              aria-label="Закрыть оверлей награды"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <img
            src={PepeGiftIcon}
            alt="Награда получена"
            className="bp-overlay-mascot mx-auto mt-4 h-[140px] w-[140px] object-contain"
          />

          <p className="mt-5 mb-3 text-center text-[26px] font-medium text-white/95">Награды</p>
          <div className="grid grid-cols-3 gap-2.5">
            {mapRewards(rewards).map((reward) => (
              <div
                key={reward.id}
                className={cn(
                  'h-[80px] rounded-[10px] bg-[#131214] p-2',
                  reward.isCompleted && 'bp-claimed-slot'
                )}
              >
                {reward.isCompleted ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    {isValidUrl(reward.imageUrl) ? (
                      <img
                        src={reward.imageUrl}
                        alt="Reward"
                        className="h-[34px] w-[34px] object-contain"
                      />
                    ) : reward.rewardType === 'TON' ? (
                      <TonIcon className="h-[34px] w-[34px]" />
                    ) : (
                      <BpPointsIcon className="h-[34px] w-[34px]" />
                    )}
                    <span className="text-[14px] leading-none font-semibold text-white">
                      x{reward.multiplier}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-[86px] left-1/2 z-[10001] w-[calc(100%-2rem)] max-w-[370px] -translate-x-1/2">
        <Button
          className="h-[41px] w-full rounded-[7.4px] bg-[#131214] text-[14px] font-medium text-white"
          variant="secondary"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </div>
    </div>
  );
};

export const BattlePassPage: FC = () => {
  const { data: battlePassData, isLoading, isError } = useBattlePass();
  const claimReward = useClaimBattlePassReward();
  const { showToast } = useToast();
  const [claimedRewardIds, setClaimedRewardIds] = useState<number[]>([]);
  const [isPromoOverlayOpen, setIsPromoOverlayOpen] = useState(false);

  const isBpActive = !isError && Boolean(battlePassData?.level);

  const rewards = useMemo(() => {
    if (!battlePassData?.rewards) return [];
    return battlePassData.rewards.map(mapBattlePassReward).map((reward) => ({
      ...reward,
      isCompleted: reward.isCompleted || claimedRewardIds.includes(reward.id),
    }));
  }, [battlePassData?.rewards, claimedRewardIds]);

  const nextLevel = (battlePassData?.level ?? 0) + 1;
  const progress = battlePassData?.progress ?? 0;
  const currentLevel = battlePassData?.level ?? 0;

  const handleClaimReward = (rewardToClaim: BattlePassRewardUI) => {
    claimReward.mutate(rewardToClaim.id, {
      onSuccess: () => {
        setClaimedRewardIds((prev) =>
          prev.includes(rewardToClaim.id) ? prev : [...prev, rewardToClaim.id]
        );
        showToast('Награда получена!', 'success');
      },
      onError: (err) => {
        if (err.response?.data.detail === 'Reward already claimed') {
          showToast('Награда уже получена', 'info');
          return;
        }

        showToast('Не удалось получить награду', 'error');
      },
    });
  };

  const handleCloseOverlay = () => {
    setIsPromoOverlayOpen(false);
  };

  const handleOpenPromoOverlay = () => {
    setIsPromoOverlayOpen(true);
  };

  if (isLoading && !battlePassData) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  return (
    <>
      <Page back>
        <div className="flex flex-col gap-[20px] pb-20">
          <BattlePassPromoCard isActive={isBpActive} onOpenOverlay={handleOpenPromoOverlay} />

          <BattlePassProgress
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            progress={progress}
            currentExp={battlePassData?.exp ?? 0}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rewards.map((reward, index) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                canClaim={reward.level <= currentLevel}
                index={index}
                currentLevel={currentLevel}
                onClaim={handleClaimReward}
              />
            ))}
          </div>
        </div>
      </Page>
      <ClaimOverlay open={isPromoOverlayOpen} rewards={rewards} onClose={handleCloseOverlay} />
    </>
  );
};
