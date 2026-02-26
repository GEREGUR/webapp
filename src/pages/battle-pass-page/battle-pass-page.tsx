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
import TomCatIcon from '@/shared/assets/tom-cat.png';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import PepeGiftIcon from '@/shared/assets/pepe-gift.png';
import { useToast } from '@/shared/ui/toast';
import { Loader } from '@/shared/ui/spinner';
import { X } from 'lucide-react';

interface RewardCardProps {
  reward: BattlePassRewardUI;
  onClaim: (reward: BattlePassRewardUI) => void;
}

const RewardCard: FC<RewardCardProps> = ({ reward, onClaim }) => {
  return (
    <div
      className={cn(
        'bg-card-dark relative flex h-[219px] w-[172px] flex-col rounded-[12px] border-[1px] p-[10px]',
        reward.isCompleted ? 'border-green-bp' : 'border-blue-bp'
      )}
    >
      <div className="bg-blue-bp absolute top-0 left-0 flex h-[38px] w-[38px] items-center justify-center rounded-[12px] p-[8px]">
        <span className="text-[28px] leading-[16.71px] font-normal text-white">{reward.level}</span>
      </div>

      <div className="bg-ghost mt-[10px] flex h-[116px] w-[119px] items-center justify-center self-center rounded-[10px]">
        {reward.rewardType === 'brick' ? (
          <img src={TomCatIcon} alt="Brick" className="h-[100px] w-[100px]" />
        ) : (
          <BpPointsIcon className="text-secondary h-[100px] w-[100px]" />
        )}
      </div>

      <div className="mt-[10px] flex items-center justify-between px-5.5">
        <span className="text-[14px] leading-[16.71px] font-medium text-white">
          x{reward.multiplier}
        </span>
        <span className="text-[14px] leading-[16.71px] font-medium text-white">
          {reward.rewardType === 'brick' ? 'Brick' : 'BP'}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-center">
        {reward.isCompleted ? (
          <div className="flex justify-center">
            <CheckmarkIcon />
          </div>
        ) : (
          <Button
            className="bg-button-bp h-[30px] w-full max-w-[119px] rounded-[7.4px] px-[6px] py-0 text-[12px] font-medium text-white"
            variant="secondary"
            onClick={() => onClaim(reward)}
          >
            Забрать награду
          </Button>
        )}
      </div>
    </div>
  );
};

interface ClaimOverlayProps {
  open: boolean;
  reward: BattlePassRewardUI | null;
  onClose: () => void;
}

const ClaimOverlay: FC<ClaimOverlayProps> = ({ open, reward, onClose }) => {
  const slots = useMemo(
    () => [
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
      'slot-7',
      'slot-8',
      'slot-9',
    ],
    []
  );
  const claimedSlotId = 'slot-2';

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

  if (!open || !reward) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#5F81D8] px-3 pt-3 pb-6">
      <div>
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[70%]',
            'bg-[conic-gradient(from_100deg_at_50%_12%,rgba(255,255,255,0.25),rgba(255,255,255,0.06),rgba(255,255,255,0.2),rgba(255,255,255,0.08),rgba(255,255,255,0.22),rgba(255,255,255,0.04),rgba(255,255,255,0.25))]'
          )}
        />
        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-center">
            <h2 className="text-[38px] leading-none font-medium text-white/95">Батлпасс</h2>
            <button
              type="button"
              className="absolute top-0 -right-8 rounded-md p-1 text-white/90 transition hover:bg-white/10 hover:text-white"
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
            {slots.map((slotId) => {
              const isClaimedSlot = slotId === claimedSlotId;

              return (
                <div
                  key={slotId}
                  className={cn(
                    'h-[112px] rounded-[16px] border border-[#4E75D2] bg-[#0C0F18] p-2',
                    isClaimedSlot && 'bp-claimed-slot border-[#82A7FF] bg-[#0D1322]'
                  )}
                >
                  {isClaimedSlot ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      {reward.rewardType === 'brick' ? (
                        <img src={TomCatIcon} alt="Brick reward" className="h-[64px] w-[64px]" />
                      ) : (
                        <BpPointsIcon className="h-[31px] w-[62px]" />
                      )}
                      <span className="text-[32px] leading-none font-bold text-white">
                        x{reward.multiplier}
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BattlePassPage: FC = () => {
  const { data, isLoading, isError } = useBattlePass();
  const claimReward = useClaimBattlePassReward();
  const activateBattlePass = useActivateBattlePass();
  const { showToast } = useToast();
  const [claimedReward, setClaimedReward] = useState<BattlePassRewardUI | null>(null);

  const isBpActive = !isLoading && !isError && !!data;

  const rewards = useMemo(() => {
    if (!data?.rewards) return [];
    return data.rewards.map(mapBattlePassReward);
  }, [data?.rewards]);

  const nextLevel = (data?.level ?? 0) + 1;
  const progress = data?.progress ?? 0;

  const handleActivate = () => {
    activateBattlePass.mutate(undefined, {
      onSuccess: () => {
        showToast('Battle Pass активирован!', 'success');
      },
      onError: () => {
        showToast('Не удалось активировать Battle Pass', 'error');
      },
    });
  };

  const handleClaimReward = (rewardToClaim: BattlePassRewardUI) => {
    claimReward.mutate(rewardToClaim.id, {
      onSuccess: () => {
        setClaimedReward({ ...rewardToClaim, isCompleted: true });
        showToast('Награда получена!', 'success');
      },
      onError: () => {
        showToast('Не удалось получить награду', 'error');
      },
    });
  };

  const handleCloseOverlay = () => {
    setClaimedReward(null);
  };

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  return (
    <>
      <Page back>
        <div className="flex flex-col gap-[20px]">
          <BattlePassPromoCard isActive={isBpActive} onActivate={handleActivate} />

          <BattlePassProgress
            currentLevel={data?.level ?? 1}
            nextLevel={nextLevel}
            progress={progress}
            currentExp={data?.exp ?? 0}
          />

          <div className="grid grid-cols-2 gap-[10px]">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} onClaim={handleClaimReward} />
            ))}
          </div>
        </div>
      </Page>
      <ClaimOverlay
        open={Boolean(claimedReward)}
        reward={claimedReward}
        onClose={handleCloseOverlay}
      />
    </>
  );
};
