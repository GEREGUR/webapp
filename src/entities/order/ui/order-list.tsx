import { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Order } from '../api/api.dto';
import TonIcon from '@/shared/assets/ton.svg?react';

interface OrderTimerProps {
  timestamp: number;
}

interface OrderItemProps {
  order: Order;
  onBuy?: (order: Order) => void;
  isBuying?: boolean;
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
  const diff = Date.now() - normalizedTimestamp;
  const seconds = Math.floor(diff / 1000);
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

const OrderItem = ({ order, onBuy, isBuying }: OrderItemProps) => {
  return (
    <div className="grid h-[66px] grid-cols-[42px_1fr_80px_auto] items-center gap-3 rounded-lg border border-[#5F81D8]/25 bg-[#131214] pr-4 pl-2">
      <img
        src={order.owner.avatar}
        alt={order.owner.name}
        className="size-[42px] rounded-full object-cover"
      />

      <div className="min-w-0">
        <p className="truncate text-base font-light text-white">{order.owner.username}</p>
        <p className="text-xs text-white/60">
          <OrderTimer timestamp={order.create_date} />
        </p>
      </div>

      <div className="flex items-center justify-start gap-1.5">
        <TonIcon className="size-4 text-white" />
        <span className="text-xl font-normal text-white">{order.current_ton_amount}</span>
      </div>

      <button
        type="button"
        className="w-[83px] justify-self-end rounded-[6px] bg-[#237BFF] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        onClick={() => onBuy?.(order)}
        disabled={isBuying}
      >
        {isBuying ? '...' : 'Купить'}
      </button>
    </div>
  );
};

interface OrderListProps {
  orders: Order[];
  onBuy?: (order: Order) => void;
  isBuying?: boolean;
}

export const OrderList = ({ orders, onBuy, isBuying }: OrderListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = 66;
  const rowGap = 10;

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + rowGap,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-fit w-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const order = orders[virtualItem.index];

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
              <OrderItem order={order} onBuy={onBuy} isBuying={isBuying} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
