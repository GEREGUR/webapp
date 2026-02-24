import { type FC } from 'react';
import TonIcon from '@/shared/assets/ton.svg?react';
import { cn } from '@/shared/lib/utils';

type LiveWinCardProps = {
  id: number;
  tonAmount?: number;
  status?: 'bought' | 'active' | 'unavailable';
  className?: string;
};

const formatTonAmount = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const LiveWinCard: FC<LiveWinCardProps> = ({ className, id, tonAmount = 0 }) => {
  return (
    <div
      className={cn(
        'flex h-[52px] w-[114px] flex-col items-center justify-start gap-1 overflow-hidden rounded-[10px] border-[0.69px] border-[#272525] bg-[#131214]',
        className
      )}
    >
      <div className="bg-ghost h-4.5 w-full pt-0.5 text-center text-[10px] text-[#5F81D8]">
        №{id} Выкуплен
      </div>
      <div className="flex items-center justify-center gap-1 pt-1">
        <TonIcon className="size-4 text-white" />
        <span className="text-[15px] font-medium text-white">{formatTonAmount(tonAmount)}</span>
      </div>
    </div>
  );
};
