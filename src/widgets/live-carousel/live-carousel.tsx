import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type DropItem = {
  id: number;
  status?: 'bought' | 'active' | 'unavailable';
};

const MAX_ITEMS = 15;

type Props = {
  initialItems: DropItem[];
  renderItem: (item: DropItem) => React.ReactNode;
};

export const LiveCarousel = ({ initialItems, renderItem }: Props) => {
  const [items, setItems] = useState<DropItem[]>(initialItems);
  const [paused, setPaused] = useState(false);
  const [counter, setCounter] = useState(1);

  const pushItem = useCallback((item: DropItem) => {
    setItems((prev) => {
      const next = [item, ...prev];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      pushItem({
        id: counter,
        status: 'bought',
      });
      setCounter((c) => c + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, pushItem, counter]);

  return (
    <div
      className="relative mt-2.5 w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="scrollbar-hide flex gap-3 overflow-x-auto overflow-y-hidden py-0.5">
        <div className="bg-ghost flex w-6 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl pt-1.5">
          <span className="-rotate-90 text-[10px] font-bold whitespace-nowrap">Live</span>
          <div className="size-2 animate-pulse rounded-full bg-[#5F81D8]" />
        </div>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 25,
              }}
            >
              {renderItem(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
