import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Order } from '../api/api.dto';
import TonIcon from '@/shared/assets/ton.svg?react';

interface OrderItemProps {
  order: Order;
  onBuy?: (orderId: number) => void;
  isBuying?: boolean;
}

const OrderItem = ({ order, onBuy, isBuying }: OrderItemProps) => {
  return (
    <div className="flex h-[66px] items-center justify-between rounded-lg bg-[#1a1a1d] px-3">
      <img
        src={order.owner.avatar}
        alt={order.owner.name}
        className="size-[42px] rounded-full object-cover"
      />

      <div className="flex flex-1 items-center justify-center gap-1.5">
        <TonIcon className="size-4 text-white" />
        <span className="text-sm font-medium text-white">{order.current_ton_amount}</span>
      </div>

      <button
        type="button"
        className="rounded-[6px] bg-[#237BFF] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        onClick={() => onBuy?.(order.id)}
        disabled={isBuying}
      >
        {isBuying ? '...' : 'Купить'}
      </button>
    </div>
  );
};

interface OrderListProps {
  orders: Order[];
  onBuy?: (orderId: number) => void;
  isBuying?: boolean;
}

export const OrderList = ({ orders, onBuy, isBuying }: OrderListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 66,
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
              className="px-3 py-1.5"
            >
              <OrderItem order={order} onBuy={onBuy} isBuying={isBuying} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
