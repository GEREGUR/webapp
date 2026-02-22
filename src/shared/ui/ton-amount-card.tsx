import { cn } from '@/shared/lib/utils';
import TonIcon from '@/shared/assets/ton.svg?react';

type AmountSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

const TOTAL_STEPS = 7;

export const AmountSlider = ({
  value,
  onChange,
  min = 1,
  max = 7,
  className,
}: AmountSliderProps) => {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('relative h-full w-full', className)}>
      <div className="relative z-0 h-1.5 w-full rounded-full bg-[#4E4E4E]">
        <div
          className="bg-blue absolute z-10 h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all"
        style={{ left: `${progress}%` }}
      />
      <div className="absolute inset-0 z-10 flex w-full items-center justify-between">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const stepNumber = index + 1;
          const stepPosition = (index / (TOTAL_STEPS - 1)) * 100;
          const isActive = stepNumber <= value;
          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => onChange(stepNumber)}
              className={cn(
                'absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-all',
                isActive ? 'bg-white' : 'bg-[#6E6E6E]'
              )}
              style={{ left: `${stepPosition}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

type TonAmountCardProps = {
  value: number;
  onChange: (value: number) => void;
  tonAmount: string;
  className?: string;
};

export const TonAmountCard = ({ value, onChange, tonAmount, className }: TonAmountCardProps) => {
  return (
    <div className={cn('flex h-[50px] items-center rounded-[10px] bg-[#232027] p-4', className)}>
      <div className="flex flex-1 items-center">
        <AmountSlider value={value} onChange={onChange} />
      </div>

      <div className="mx-4 h-10 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <TonIcon className="h-6 w-6" />
        <span className="text-base font-semibold text-white">{tonAmount}</span>
      </div>
    </div>
  );
};
