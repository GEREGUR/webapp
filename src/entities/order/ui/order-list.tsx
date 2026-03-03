import { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Order } from '../api/api.dto';
import TonIcon from '@/shared/assets/ton.svg?react';
import { formatFloat } from '@/shared/lib/utils';

interface OrderTimerProps {
  timestamp: number;
}

interface OrderItemProps {
  order: Order;
  onBuy?: (order: Order) => void;
  isBuying?: boolean;
  showRatio?: boolean;
  isSelfBuy?: boolean;
}

const OrderTimer = ({ timestamp }: OrderTimerProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const normalizedTimestamp = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  const elapsedMs = Math.max(0, Date.now() - normalizedTimestamp);
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let label: string;
  if (seconds < 60) {
    label = `${seconds} сек`;
  } else if (minutes < 60) {
    label = `${minutes} мин`;
  } else if (hours < 5) {
    const remainingMinutes = minutes % 60;
    label = remainingMinutes > 0 ? `${hours} ч ${remainingMinutes} мин` : `${hours} ч`;
  } else if (hours < 24) {
    label = `${hours} ч`;
  } else {
    label = `${days} дн`;
  }

  if (seconds < 60) return <>{label}</>;
  if (minutes < 60) return <>{label}</>;
  if (hours < 24) return <>{label}</>;
  return <>{label}</>;
};

const OrderItem = ({ order, onBuy, isBuying, showRatio, isSelfBuy }: OrderItemProps) => {
  const isClosed = order.status === 'CLOSED' || order.current_ton_amount === 0;

  return (
    <div className="relative h-[66px] rounded-lg border border-[#5F81D8]/25 bg-[#131214] px-2">
      <div className="absolute inset-y-0 left-2 flex max-w-[calc(100%-200px)] items-center gap-3">
        <img
          src={order.owner.avatar}
          alt={order.owner.name}
          className="size-[42px] shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0">
          <p className="truncate text-base font-light text-white">{order.owner.name}</p>
          <p className="truncate text-xs text-white/60">
            <OrderTimer timestamp={order.create_date} />
          </p>
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-[132px]">
        <div className="flex max-w-full items-center justify-center gap-1.5">
          <TonIcon className="size-4 shrink-0 text-white" />
          <span className="truncate text-center text-xl font-normal text-white">
            {showRatio || order.status === 'PARTIAL' || isSelfBuy
              ? `${formatFloat(order.current_ton_amount, 3)}/${formatFloat(order.initial_ton_amount, 3)}`
              : formatFloat(order.current_ton_amount, 3)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="absolute top-1/2 right-4 w-[91px] -translate-y-1/2 rounded-[6px] bg-[#237BFF] px-3 py-1.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        onClick={() => onBuy?.(order)}
        disabled={isBuying || isClosed}
      >
        {isBuying ? '...' : isClosed ? 'Закрыто' : isSelfBuy ? 'Выкупить' : 'Купить'}
      </button>
    </div>
  );
};

interface OrderListProps {
  orders: Order[];
  onBuy?: (order: Order) => void;
  isBuying?: boolean;
  showRatio?: boolean;
  selfBuy?: boolean;
  ownerId?: number;
}

export const OrderList = ({
  orders,
  onBuy,
  isBuying,
  showRatio,
  selfBuy,
  ownerId,
}: OrderListProps) => {
  const rowHeight = 66;
  const rowGap = 10;
  const localRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => localRef.current,
    estimateSize: () => rowHeight + rowGap,
    overscan: 5,
  });

  return (
    <div ref={localRef} className="h-fit w-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const order = orders[virtualItem.index];
          const isSelfBuyOrder = selfBuy || (ownerId !== undefined && order.owner.id === ownerId);

          return (
            <div
              key={order.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="px-4 pb-2"
            >
              <OrderItem
                order={order}
                onBuy={onBuy}
                isBuying={isBuying}
                showRatio={showRatio}
                isSelfBuy={isSelfBuyOrder}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
