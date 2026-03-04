import { type FC } from 'react';
import { useBumpOrders } from '@/entities/order';
import { useToast } from '@/shared/ui/toast';
import { Button } from '@/shared/ui/button';
import Arrow from '@/shared/assets/arrow.svg?react';

interface BumpOrdersButtonProps {
  disabled?: boolean;
  className?: string;
}

export const BumpOrdersButton: FC<BumpOrdersButtonProps> = ({ className, disabled }) => {
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
    <Button
      className={className}
      onClick={handleClick}
      disabled={bumpMutation.isPending || disabled}
    >
      <Arrow />
    </Button>
  );
};
