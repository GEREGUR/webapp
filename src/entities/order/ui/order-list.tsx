import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Order } from '../api/api.dto';
import TonIcon from '@/shared/assets/ton.svg?react';

interface OrderItemProps {
  order: Order;
  onBuy?: (order: Order) => void;
  isBuying?: boolean;
}

const formatOrderTimestamp = (timestamp: number) => {
  const normalizedTimestamp = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  const diff = Date.now() - normalizedTimestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин`;
  if (hours < 24) return `${hours} ч`;
  return `${days} дн`;
};

const OrderItem = ({ order, onBuy, isBuying }: OrderItemProps) => {
  return (
    <div className="flex h-[76px] items-center justify-between rounded-lg bg-[#1a1a1d] px-4">
      <img
        src={order.owner.avatar}
        alt={order.owner.name}
        className="size-[42px] rounded-full object-cover"
      />

      <div className="ml-3 min-w-0">
        <p className="truncate text-sm font-semibold text-white">{order.owner.username}</p>
        <p className="mt-0.5 text-xs text-white/60">{formatOrderTimestamp(order.create_date)}</p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-1.5">
          <TonIcon className="size-4 text-white" />
          <span className="text-sm font-medium text-white">{order.current_ton_amount}</span>
        </div>
      </div>

      <button
        type="button"
        className="rounded-[6px] bg-[#237BFF] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
  const rowHeight = 76;
  const rowGap = 8;

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + rowGap,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
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
