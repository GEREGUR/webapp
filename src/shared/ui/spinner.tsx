import { cn } from '@/shared/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return (
    <div className={cn('relative', sizes[size], className)}>
      <div className="border-t-primary/30 absolute inset-0 animate-spin rounded-full border-2 border-transparent" />
      <div
        className="border-t-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent"
        style={{ animationDuration: '1.2s' }}
      />
      <div
        className="absolute inset-1 animate-spin rounded-full border border-transparent border-t-white/50"
        style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}
      />
    </div>
  );
};

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader = ({ size = 'md', text = 'Загрузка...', className }: LoaderProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-8', className)}>
      <Spinner size={size} />
      {text && <p className="animate-pulse text-sm text-white/60">{text}</p>}
    </div>
  );
};
