import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
import { TonAmountCard } from '@/shared/ui/ton-amount-card';
import { CreateOrderButton } from '@/features/create-order';
import { BuyOrderDrawer } from '@/features/buy-order';
import { LiveCarousel, LiveWinCard } from '@/widgets/live-carousel';
import { MarketStatsBar } from '@/features/market-stats-bar';
import { useOrders, OrderList, type Order, useOrderSettings } from '@/entities/order';
import { MaxWidthWrapper } from '@/shared/ui/max-width-wrapper';
import { BumpOrdersButton } from '@/features/bump-orders-button';
import { useMarket } from '@/entities/market';
import { useProfile } from '@/entities/user';
import { Loader } from '@/shared/ui/spinner';

const INITIAL_ORDERS_COUNT = 4;

export const IndexPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<
    (Order & { type: 'regular' | 'instant' }) | null
  >(null);
  const [sliderValue, setSliderValue] = useState(1);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { orders: marketOrders, stats, isLoading: marketLoading } = useMarket();
  const { data: profile } = useProfile();
  const { data: orderSettings } = useOrderSettings();

  const bpBalance = profile?.internal_balance ?? 0;
  const currentRate = orderSettings ? (100 - orderSettings.fee_self_buy) / 100 : 0.85;

  const handleScroll = useCallback(() => {
    setShowAllOrders(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const displayedOrders =
    orders?.slice(0, showAllOrders ? orders.length : INITIAL_ORDERS_COUNT) ?? [];

  const handleOrderBuy = (order: Order, type: 'regular' | 'instant') => {
    setSelectedOrder({ ...order, type });
  };

  return (
    <Tabs defaultTab="market" onTabChange={() => setShowAllOrders(false)}>
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
            <MarketStatsBar
              tonAmount={stats?.total_ton ?? 0}
              orderCount={stats?.total_orders ?? 0}
            />
          </div>
          <div className="mb-3 flex items-center justify-between gap-2.5">
            <TonAmountCard
              value={sliderValue}
              onChange={setSliderValue}
              tonAmount={String(sliderValue * 10)}
              className="flex-1"
            />
          </div>
        </div>
        {marketLoading ? (
          <Card className="mx-4">
            <Loader size="sm" />
          </Card>
        ) : marketOrders && marketOrders.length > 0 ? (
          <>
            <OrderList
              orders={marketOrders.slice(0, INITIAL_ORDERS_COUNT)}
              onBuy={(order) => handleOrderBuy(order, 'regular')}
            />
            <AnimatePresence>
              {showAllOrders && marketOrders.length > INITIAL_ORDERS_COUNT && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrderList
                    orders={marketOrders.slice(INITIAL_ORDERS_COUNT)}
                    onBuy={(order) => handleOrderBuy(order, 'regular')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {marketOrders.length > INITIAL_ORDERS_COUNT && (
              <AnimatePresence>
                {!showAllOrders && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <CreateOrderButton bpBalance={bpBalance} currentRate={currentRate} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div className={showAllOrders ? 'h-[50px]' : 'h-[100px]'} />
          </>
        ) : (
          <>
            <Card className="mx-4">
              <p className="text-center text-white/60">Нет ордеров</p>
            </Card>
            <CreateOrderButton bpBalance={bpBalance} currentRate={currentRate} />
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

            <BumpOrdersButton className="bg-ghost h-[50px]" />
          </div>
        </div>
        {ordersLoading ? (
          <Card className="mx-4">
            <Loader size="sm" />
          </Card>
        ) : orders && orders.length > 0 ? (
          <div className="h-[calc(100vh-280px)] overflow-auto">
            <OrderList
              orders={displayedOrders}
              onBuy={(order) => handleOrderBuy(order, 'instant')}
            />
            {!showAllOrders && orders.length > INITIAL_ORDERS_COUNT && (
              <div className="px-4 pb-4">
                <CreateOrderButton bpBalance={bpBalance} currentRate={currentRate} />
              </div>
            )}
          </div>
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
          rate={orderSettings?.rate ?? 1}
          orderType={selectedOrder.type}
          defaultRegularTonAmount={selectedOrder.current_ton_amount}
          settings={orderSettings}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </Tabs>
  );
};
