import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
import { TonAmountCard } from '@/shared/ui/ton-amount-card';
import { CreateOrderButton } from '@/features/create-order';
import { BuyOrderDrawer } from '@/features/buy-order';
import { LiveCarousel, LiveWinCard } from '@/widgets/live-carousel';
import { MarketStatsBar } from '@/widgets/market-stats-bar';
import { useOrders, OrderList, type Order } from '@/entities/order';
import { MaxWidthWrapper } from '@/shared/ui/max-width-wrapper';
import { Button } from '@/shared/ui/button';
import { useMarket } from '@/entities/market';
import { useProfile } from '@/entities/user';
import HistoryIcon from '@/shared/assets/history.svg?react';
import { Loader } from '@/shared/ui/spinner';
import Arrow from '@/shared/assets/arrow.svg?react';

export const IndexPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sliderValue, setSliderValue] = useState(1);
  const [sortAscending, setSortAscending] = useState(true);
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { orders: marketOrders, stats, isLoading: marketLoading } = useMarket();
  const { data: profile } = useProfile();

  const bpBalance = profile?.internal_balance ?? 0;

  const handleOrderBuy = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <Tabs defaultTab="market">
      <div className="pt-6">
        <MaxWidthWrapper>
          <TabList className="mb-2 flex gap-4">
            <Tab value="market" className="transition-colors">
              Рынок
            </Tab>
            <Tab value="orders" className="transition-colors">
              Мои ордера
            </Tab>
          </TabList>
        </MaxWidthWrapper>
      </div>

      <TabPanel value="market">
        <MaxWidthWrapper disableRightPadding>
          <LiveCarousel>{(item) => <LiveWinCard {...item} />}</LiveCarousel>
        </MaxWidthWrapper>
        <div className="px-4 md:px-12">
          <div className="my-2">
            <MarketStatsBar tonAmount={stats?.total_ton} orderCount={stats?.total_orders} />
          </div>
          <div className="mb-3 flex items-center justify-between gap-2.5">
            <TonAmountCard
              value={sliderValue}
              onChange={setSliderValue}
              tonAmount={String(sliderValue * 10)}
              className="flex-1"
            />

            <Button className="bg-ghost h-[50px]">
              <HistoryIcon />
            </Button>
          </div>
        </div>
        {marketLoading ? (
          <Card className="mx-4">
            <Loader size="sm" />
          </Card>
        ) : marketOrders && marketOrders.length > 0 ? (
          <>
            <OrderList orders={marketOrders} onBuy={handleOrderBuy} />
            <CreateOrderButton bpBalance={bpBalance} />
          </>
        ) : (
          <>
            <Card className="mx-4">
              <p className="text-center text-white/60">Нет ордеров</p>
            </Card>
            <CreateOrderButton bpBalance={bpBalance} />
          </>
        )}
      </TabPanel>

      <TabPanel value="orders">
        <div className="px-4 md:px-12">
          <div className="mt-2 mb-3 flex items-center justify-between gap-4">
            <TonAmountCard
              value={sliderValue}
              onChange={setSliderValue}
              tonAmount={String(sliderValue * 10)}
              className="flex-1"
            />

            <Button className="bg-ghost h-[50px]" onClick={() => setSortAscending(!sortAscending)}>
              {sortAscending ? (
                <Arrow className="size-4" />
              ) : (
                <Arrow className="size-4 rotate-180" />
              )}
            </Button>
          </div>
        </div>
        {ordersLoading ? (
          <Card className="mx-4">
            <Loader size="sm" />
          </Card>
        ) : orders && orders.length > 0 ? (
          <OrderList orders={orders} onBuy={handleOrderBuy} />
        ) : (
          <Card className="mx-4">
            <p className="text-center text-white/60">У вас пока нет ордеров</p>
          </Card>
        )}
      </TabPanel>

      {selectedOrder && (
        <BuyOrderDrawer
          open={Boolean(selectedOrder)}
          lotId={selectedOrder.id}
          tonBalance={profile?.ton_balance ?? 0}
          orderType="instant"
          defaultRegularTonAmount={selectedOrder.current_ton_amount}
          defaultInstantBpAmount={Math.floor(selectedOrder.current_ton_amount * 0.85)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </Tabs>
  );
};
