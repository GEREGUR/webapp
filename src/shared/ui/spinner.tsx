import { cn } from '@/shared/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return (
    <div
      className={cn(
        'border-t-primary animate-spin rounded-full border-2 border-white/20',
        sizes[size],
        className
      )}
    />
  );
};
