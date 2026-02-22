import { cn } from '@/shared/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-[104px] h-[104px] text-2xl',
};

export const Avatar = ({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full bg-white/10',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium text-white">{fallback?.charAt(0).toUpperCase() || '?'}</span>
      )}
    </div>
  );
};
