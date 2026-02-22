import { type FC } from 'react';
import { cn } from '@/shared/lib/utils';

interface MarketStatsBarProps {
  tonAmount: number;
  orderCount: number;
  className?: string;
}

export const MarketStatsBar: FC<MarketStatsBarProps> = ({ tonAmount, orderCount, className }) => {
  return (
    <div
      className={cn(
        'relative z-10 flex h-[26px] w-full items-center rounded-[10px] border border-white/10 bg-[#131214] px-3.5 opacity-100',
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs font-medium text-white">{tonAmount} TON</span>
      </div>
      <div className="h-2.5 w-px bg-white/20" />
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs font-medium text-white">{orderCount} Предложений</span>
      </div>
    </div>
  );
};
