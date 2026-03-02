import { useReducedMotion } from 'motion/react';
import { useMarket, type DropItem } from '@/entities/market';
import { LazyMotion, AnimatePresence, m, domAnimation } from 'motion/react';

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
  const { items } = useMarket();
  const reducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mt-2.5 w-full overflow-visible">
        <div className="[-webkit-overflow-scrolling-touch] flex h-[54px] gap-3 overflow-x-auto overflow-y-hidden py-0.5 [-webkit-scrollbar]:hidden">
          <div className="bg-ghost flex w-6 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl pt-1.5">
            <span className="-rotate-90 text-[10px] font-bold whitespace-nowrap text-white">
              Live
            </span>
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
