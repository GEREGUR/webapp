import { FC, useEffect } from 'react';
import { BattlePassRewardUI } from '@/entities/battle-pass';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';
import PepeGiftIcon from '@/shared/assets/pepe-gift.png';
import { getRewardIcon, mapRewards } from '../lib/utils';
import { Button } from '@/shared/ui/button';
import { viewport } from '@tma.js/sdk-react';

interface ClaimOverlayProps {
  open: boolean;
  rewards: BattlePassRewardUI[];
  onClose: () => void;
}

export const ClaimOverlay: FC<ClaimOverlayProps> = ({ open, rewards, onClose }) => {
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
        'fixed inset-0 z-[10000] w-full bg-[#5F81D8] p-4 pb-[50px]',
        isScrollable ? 'overflow-y-auto' : 'overflow-hidden',
        { 'pt-34': viewport.isFullscreen() }
      )}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `conic-gradient(from -92deg at 49% ${viewport.isFullscreen() ? '28%' : '13%'}, rgba(255,255,255,0.26) 0deg 19deg, rgba(255,255,255,0.05) 19deg 42deg, rgba(255,255,255,0.23) 42deg 74deg, rgba(255,255,255,0.06) 74deg 95deg, rgba(255,255,255,0.2) 95deg 131deg, rgba(255,255,255,0.04) 131deg 152deg, rgba(255,255,255,0.22) 152deg 188deg, rgba(255,255,255,0.05) 188deg 214deg, rgba(255,255,255,0.24) 214deg 247deg, rgba(255,255,255,0.06) 247deg 271deg, rgba(255,255,255,0.2) 271deg 309deg, rgba(255,255,255,0.05) 309deg 334deg, rgba(255,255,255,0.24) 334deg 360deg)`,
          WebkitMaskImage:
            'radial-gradient(circle at 50% 27%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0) 100%)',
          maskImage:
            'radial-gradient(circle at 50% 27%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_27%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_33%,rgba(255,255,255,0)_68%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[370px]">
        <div>
          <div className="relative mb-2 flex items-center justify-center">
            <h2 className="text-[38px] leading-none font-medium text-white/95">Батлпасс</h2>
            <button
              type="button"
              className="absolute right-0 bottom-px rounded-md text-white/90 transition hover:bg-white/10 hover:text-white"
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
                    {(() => {
                      const Icon = getRewardIcon(reward.rewardType);
                      return <Icon className="size-[50px]" />;
                    })()}
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
