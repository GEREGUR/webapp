import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'rounded-lg font-semibold transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-primary text-white hover:brightness-110 active:scale-[0.98]': variant === 'primary',
          'bg-secondary text-white hover:brightness-110 active:scale-[0.98]':
            variant === 'secondary',
          'bg-transparent text-white hover:bg-white/10': variant === 'ghost',
          'bg-blue text-white hover:brightness-110 active:scale-[0.98]': variant === 'blue',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
