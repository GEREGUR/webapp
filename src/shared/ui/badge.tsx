import { cn } from '@/shared/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variants = {
  default: 'bg-white/10 text-white',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/20 text-red-400',
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
