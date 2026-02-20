import * as React from 'react';
import { cn } from '@/shared/lib/utils';
export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)];
      onValueChange?.(newValue);
    };

    return (
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value?.[0] ?? min}
          onChange={handleChange}
          ref={ref}
          className={cn(
            'bg-muted h-2 w-full cursor-pointer appearance-none rounded-full',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,6,225,0.5)]',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:shadow-[0_0_10px_rgba(255,6,225,0.5)]',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
