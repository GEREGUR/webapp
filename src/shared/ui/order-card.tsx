import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { Order } from '@/entities/order';

interface OrderCardProps {
  order: Order;
  onBuy?: (orderId: number) => void;
  isBuying?: boolean;
}

const statusColors: Record<string, string> = {
  OPEN: 'text-green-400',
  PARTIAL: 'text-yellow-400',
  CLOSED: 'text-gray-400',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Открыт',
  PARTIAL: 'Частично',
  CLOSED: 'Закрыт',
};

export const OrderCard = ({ order, onBuy, isBuying }: OrderCardProps) => {
  const progress =
    order.initial_ton_amount > 0
      ? ((order.initial_ton_amount - order.current_ton_amount) / order.initial_ton_amount) * 100
      : 0;

  return (
    <Card className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-primary text-sm font-bold">
              {order.owner.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{order.owner.name}</p>
            <p className="text-xs text-white/40">@{order.owner.username}</p>
          </div>
        </div>
        <span className={`text-xs font-medium ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Продаёт</span>
          <span className="text-white">{order.initial_bp_amount} BP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">За</span>
          <span className="text-white">{order.initial_ton_amount} TON</span>
        </div>

        {order.status === 'OPEN' && (
          <>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-white/60">
                <span>Продано</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {order.current_ton_amount > 0 && onBuy && (
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={() => onBuy(order.id)}
                disabled={isBuying}
              >
                {isBuying ? 'Покупка...' : `Купить ${order.current_ton_amount} TON`}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
