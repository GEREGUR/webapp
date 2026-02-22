import { type FC } from 'react';
import { cn } from '@/shared/lib/utils';

const LEVEL_STYLES =
  'font-[SF_Pro_Display] font-medium text-[14px] leading-[20.94px] tracking-[0] align-middle';

const EXP_STYLES =
  'font-[SF_Pro_Display] font-medium text-[17px] leading-[20.94px] tracking-[0] align-middle text-black';

export interface BattlePassProgressProps {
  currentLevel: number;
  nextLevel: number;
  progress: number;
  currentExp: number;
  className?: string;
}

export const BattlePassProgress: FC<BattlePassProgressProps> = ({
  currentLevel,
  nextLevel,
  progress,
  currentExp,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-px', className)}>
      <div className="flex justify-between">
        <span className={cn(LEVEL_STYLES, 'text-[#5F81D8]')}>LVL {currentLevel}</span>
        <span className={cn(LEVEL_STYLES, 'text-[#5F81D8]')}>LVL {nextLevel}</span>
      </div>

      <div className="relative">
        <div className="h-[24px] w-full overflow-hidden rounded-full border-[1px] border-[#272525] bg-[#131214]">
          <div
            className="h-full rounded-full bg-[#A6FF8B] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={EXP_STYLES}>{currentExp} EXP</span>
        </div>
      </div>
    </div>
  );
};
