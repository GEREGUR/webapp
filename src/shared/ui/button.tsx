import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'purple' | 'accent';
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
        'rounded-md font-semibold transition-all',
        'disabled:opacity-50',
        {
          'bg-[#1a3a6e] text-white hover:brightness-110 active:scale-[0.98] disabled:bg-[#6E91E7]':
            variant === 'primary',
          'bg-white/20 text-white hover:brightness-110 active:scale-[0.98] disabled:bg-[#2F3033] disabled:text-white':
            variant === 'secondary',
          'bg-[#232027] text-white hover:brightness-125 active:scale-[0.98]': variant === 'ghost',
          'bg-[#9b4dca] text-white hover:brightness-110 active:scale-[0.98] disabled:bg-[#2F3033]':
            variant === 'purple',
          'bg-[#237BFF] text-white hover:brightness-110 active:scale-[0.98] disabled:bg-[#237BFF]/80':
            variant === 'accent',
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
