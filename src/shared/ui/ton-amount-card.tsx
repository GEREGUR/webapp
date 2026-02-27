import { cn } from '@/shared/lib/utils';
import { BumpOrdersButton } from '@/features/bump-orders-button';

type AmountSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

const STEPS = [1, 10, 50, 100, 250, 500, 1000];

const AmountSlider = ({ value, onChange, min = 1, max = 1000, className }: AmountSliderProps) => {
  const progress = ((value - min) / (max - min)) * 100;

  const handleChange = (newValue: number) => {
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className={cn('relative flex h-full w-full min-w-44 flex-1', className)}>
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
        onChange={(e) => handleChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all"
        style={{ left: `${progress}%` }}
      />
      <div className="absolute inset-0 z-10 flex w-full items-center justify-between">
        {STEPS.map((step, index) => {
          const stepPosition = (index / (STEPS.length - 1)) * 100;
          const isActive = step <= value;
          return (
            <button
              key={step}
              type="button"
              onClick={() => handleChange(step)}
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
    <div
      className={cn(
        'relative z-10 flex h-[50px] w-full items-center rounded-[10px] bg-[#232027] pl-7',
        className
      )}
    >
      <div className="flex flex-1 items-center">
        <AmountSlider value={value} onChange={onChange} min={1} max={1000} />
      </div>

      <div className="mx-4 h-10 w-px bg-white/10" />

      <BumpOrdersButton tonAmount={tonAmount} />
    </div>
  );
};
