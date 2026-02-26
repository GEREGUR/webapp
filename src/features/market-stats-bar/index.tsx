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
        'relative z-10 flex h-[26px] w-full items-center rounded-[10px] border border-white/10 bg-[#131214] px-3.5 font-normal opacity-100',
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center">
        <span className="min-w-fit text-[13px] text-white" key={tonAmount}>
          {tonAmount.toFixed(0)} TON
        </span>
      </div>
      <div className="h-2.5 w-px bg-white" />
      <div className="flex flex-1 items-center justify-center">
        <span className="min-w-fit text-[13px] text-white" key={orderCount}>
          {orderCount.toFixed(0)} Предложений
        </span>
      </div>
    </div>
  );
};
