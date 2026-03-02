import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import TonIcon from '@/shared/assets/ton.svg?react';

type AmountSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

const STEPS = [0, 150, 350, 500, 650, 850, 1000];
const MIN = 0;
const MAX = 1000;

const AmountSlider = ({ value, onChange, className }: AmountSliderProps) => {
  const clampedValue = Math.max(MIN, Math.min(MAX, value));
  const progress = ((clampedValue - MIN) / (MAX - MIN)) * 100;

  const handleChange = (newValue: number) => {
    onChange(Math.max(MIN, Math.min(MAX, newValue)));
  };

  return (
    <div className={cn('relative flex h-full w-full min-w-44 flex-1 select-none', className)}>
      <div className="relative z-0 h-1.5 w-full rounded-full bg-[#4E4E4E]">
        <div
          className="bg-blue absolute z-10 h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={1}
        value={clampedValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 select-none"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md select-none"
        style={{ left: `${progress}%` }}
      />
      <div className="absolute inset-0 z-10 flex w-full items-center justify-between">
        {STEPS.map((step, index) => {
          const stepPosition = (index / (STEPS.length - 1)) * 100;
          const isActive = step <= clampedValue;

          return (
            <button
              key={step}
              type="button"
              onClick={() => handleChange(step)}
              className={cn(
                'absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                isActive ? 'bg-white' : 'bg-[#6E6E6E]',
                { 'opacity-0': index === 0 || index === 6 }
              )}
              style={{ left: `${stepPosition}%` }}
              draggable={false}
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
  tonAmount: number;
  className?: string;
  onFilterChange?: (value: number) => void;
  filterDebounceMs?: number;
};

export const TonAmountCard = ({
  value,
  onChange,
  tonAmount,
  className,
  onFilterChange,
  filterDebounceMs = 300,
}: TonAmountCardProps) => {
  const sliderValue = Math.max(1, Math.min(1000, value));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!onFilterChange) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onFilterChange(sliderValue);
    }, filterDebounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filterDebounceMs, onFilterChange, sliderValue]);

  return (
    <div
      className={cn(
        'relative z-10 flex h-[50px] w-full items-center rounded-[10px] bg-[#232027] pl-7',
        className
      )}
    >
      <div className="flex flex-1 items-center">
        <AmountSlider value={sliderValue} onChange={onChange} min={1} max={1000} />
      </div>

      <div className="mx-4 h-10 w-px bg-white/10" />

      <div className="flex w-[80px] shrink-0 items-center justify-end gap-2 pr-3">
        <TonIcon className="size-4 pt-px" />
        <span className={cn('w-[40px] text-[17px] leading-none font-semibold text-white')}>
          {tonAmount}
        </span>
      </div>
    </div>
  );
};
