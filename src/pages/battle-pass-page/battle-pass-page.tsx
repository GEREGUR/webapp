import { type FC, useMemo, useState } from 'react';
import { Page, PageLoader } from '@/pages/page';
import { BattlePassProgress } from '@/features/battle-pass-progress';
import { BattlePassPromoCard } from '@/features/battle-pass-promo';
import {
  useBattlePass,
  useClaimBattlePassReward,
  mapBattlePassReward,
  type BattlePassRewardUI,
} from '@/entities/battle-pass';
import { useToast } from '@/shared/ui/toast';
import { ClaimOverlay } from './ui/claim-overlay';
import { RewardList } from './ui/rewards';

export const BattlePassPage: FC = () => {
  const { data: battlePassData, isLoading, isError } = useBattlePass();
  const claimReward = useClaimBattlePassReward();
  const { showToast } = useToast();
  const [claimedRewardIds, setClaimedRewardIds] = useState<number[]>([]);
  const [isPromoOverlayOpen, setIsPromoOverlayOpen] = useState(false);

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

  const isBpActive = !isError && Boolean(battlePassData?.rewards.length);
  const handleCloseOverlay = () => {
    setIsPromoOverlayOpen(false);
  };

  const handleOpenPromoOverlay = () => {
    setIsPromoOverlayOpen(true);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <Page back>
        <div className="flex flex-col gap-[20px] pb-20">
          <BattlePassPromoCard
            isActive={isBpActive}
            isLoading={isLoading}
            onOpenOverlay={handleOpenPromoOverlay}
          />

          <BattlePassProgress
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            progress={progress}
            currentExp={battlePassData?.exp ?? 0}
          />

          <RewardList onClaim={handleClaimReward} rewards={rewards} currentLevel={currentLevel} />
        </div>
      </Page>
      <ClaimOverlay open={isPromoOverlayOpen} rewards={rewards} onClose={handleCloseOverlay} />
    </>
  );
};
