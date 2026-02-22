import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
import { CreateOrderButton } from '@/features/create-order/ui';
import {
  useOrders,
  useBuyOrder,
  useMarketOrders,
  useCreateOrder,
  OrderList,
} from '@/entities/order';
import { MaxWidthWrapper } from '@/shared/ui/max-width-wrapper';

export const IndexPage = () => {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: marketOrders, isLoading: marketLoading } = useMarketOrders();
  const buyOrderMutation = useBuyOrder();
  const createOrderMutation = useCreateOrder();

  const handleOrderBuy = (orderId: number) => {
    buyOrderMutation.mutate({ order_id: orderId, ton_amount: 0 });
  };

  const handleCreateOrder = (data: { bp_amount: number }) => {
    createOrderMutation.mutate({ bp_amount: data.bp_amount });
  };

  return (
    <Tabs defaultTab="market">
      <div className="pt-4">
        <MaxWidthWrapper>
          <TabList className="mb-4 flex gap-1">
            <Tab
              value="market"
              className="flex-1 rounded text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
            >
              Рынок
            </Tab>
            <Tab
              value="orders"
              className="flex-1 rounded text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
            >
              Мои ордера
            </Tab>
          </TabList>
        </MaxWidthWrapper>
      </div>

      <TabPanel value="market">
        {marketLoading ? (
          <Card>
            <p className="text-center text-white/60">Загрузка...</p>
          </Card>
        ) : marketOrders && marketOrders.length > 0 ? (
          <>
            <OrderList
              orders={marketOrders}
              onBuy={handleOrderBuy}
              isBuying={buyOrderMutation.isPending}
            />
            <div className="mt-4">
              <CreateOrderButton onSubmit={handleCreateOrder} />
            </div>
          </>
        ) : (
          <>
            <Card>
              <p className="text-center text-white/60">Нет ордеров</p>
            </Card>
            <div className="mt-4">
              <CreateOrderButton onSubmit={handleCreateOrder} />
            </div>
          </>
        )}
      </TabPanel>

      <TabPanel value="orders">
        {ordersLoading ? (
          <Card>
            <p className="text-center text-white/60">Загрузка...</p>
          </Card>
        ) : orders && orders.length > 0 ? (
          <OrderList orders={orders} onBuy={handleOrderBuy} isBuying={buyOrderMutation.isPending} />
        ) : (
          <Card>
            <p className="text-center text-white/60">У вас пока нет ордеров</p>
          </Card>
        )}
      </TabPanel>
    </Tabs>
  );
};
