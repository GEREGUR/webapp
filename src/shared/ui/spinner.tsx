import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return <Loader2 className={cn('text-primary animate-spin', className)} size={sizes[size]} />;
};

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ size = 'md', className }: LoaderProps) => {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Spinner size={size} />
    </div>
  );
};
