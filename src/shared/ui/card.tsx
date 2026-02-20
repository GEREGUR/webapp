import { cn } from '@/shared/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={cn('rounded-lg border border-white/10 bg-white/5 p-4', className)} {...props}>
      {children}
    </div>
  );
};
