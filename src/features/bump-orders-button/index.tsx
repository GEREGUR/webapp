import { type FC } from 'react';
import { useBumpOrders } from '@/entities/order';
import { useToast } from '@/shared/ui/toast';
import TonIcon from '@/shared/assets/ton.svg?react';
import { cn } from '@/shared/lib/utils';

interface BumpOrdersButtonProps {
  tonAmount: string;
  className?: string;
}

export const BumpOrdersButton: FC<BumpOrdersButtonProps> = ({ tonAmount, className }) => {
  const bumpMutation = useBumpOrders();
  const { showToast } = useToast();

  const handleClick = () => {
    bumpMutation.mutate(undefined, {
      onSuccess: () => {
        showToast('Ордера подняты!', 'success');
      },
      onError: () => {
        showToast('Не удалось поднять ордера', 'error');
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={bumpMutation.isPending}
      className={cn('flex cursor-pointer items-center justify-center gap-2 pr-3', className)}
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
