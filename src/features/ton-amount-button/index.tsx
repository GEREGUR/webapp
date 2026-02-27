import { type FC } from 'react';
import { useBumpOrder } from '@/entities/order';
import { useToast } from '@/shared/ui/toast';
import TonIcon from '@/shared/assets/ton.svg?react';
import { cn } from '@/shared/lib/utils';

interface TonAmountButtonProps {
  tonAmount: string;
  orderId?: number;
  className?: string;
}

export const TonAmountButton: FC<TonAmountButtonProps> = ({ tonAmount, orderId, className }) => {
  const bumpMutation = useBumpOrder();
  const { showToast } = useToast();

  const handleClick = () => {
    if (!orderId) return;

    bumpMutation.mutate(orderId, {
      onSuccess: () => {
        showToast('Ордер поднят!', 'success');
      },
      onError: () => {
        showToast('Не удалось поднять ордер', 'error');
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!orderId || bumpMutation.isPending}
      className={cn(
        'flex items-center justify-center gap-2 pr-3',
        orderId && 'cursor-pointer',
        !orderId && 'cursor-default',
        className
      )}
    >
      <TonIcon className="size-4 pt-px" />
      <span
        className={cn(
          'font-semibold text-white',
          Number(tonAmount) * 10 > 100 ? 'text-[10px]' : 'text-base'
        )}
      >
        {tonAmount}
      </span>
    </button>
  );
};
