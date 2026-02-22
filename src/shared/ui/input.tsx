import { cn } from '@/shared/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/40',
        'focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};
