import { useReducedMotion } from 'motion/react';
import { useLiveDeals } from '@/shared/contexts/websocket';
import { LazyMotion, AnimatePresence, m, domAnimation } from 'motion/react';

type DropItem = {
  id: number;
  uid: string;
  tonAmount: number;
  status?: 'bought' | 'active' | 'unavailable';
};

const LiveCarouselItem = ({
  item,
  children,
  reducedMotion,
}: {
  item: DropItem;
  children: (item: DropItem) => React.ReactNode;
  reducedMotion: boolean | null;
}) => {
  return (
    <m.div
      key={item.uid}
      layout
      {...(reducedMotion
        ? {}
        : {
            initial: { x: -80, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { opacity: 0 },
            transition: {
              type: 'spring',
              stiffness: 260,
              damping: 25,
            },
          })}
    >
      {children(item)}
    </m.div>
  );
};

interface Props {
  initialItems?: DropItem[];
  children: (item: DropItem) => React.ReactNode;
}

export const LiveCarousel = ({ children }: Props) => {
  const { items } = useLiveDeals();
  const reducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mt-2.5 w-full overflow-hidden">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto overflow-y-hidden py-0.5">
          <div className="bg-ghost flex w-6 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl pt-1.5">
            <span className="-rotate-90 text-[10px] font-bold whitespace-nowrap">Live</span>
            <div className="size-2 animate-pulse rounded-full bg-[#5F81D8]" />
          </div>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <LiveCarouselItem
                key={item.uid}
                item={item}
                children={children}
                reducedMotion={reducedMotion}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
};
