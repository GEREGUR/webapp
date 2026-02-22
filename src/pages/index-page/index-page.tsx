import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';
import { Card } from '@/shared/ui/card';
import { CreateOrderButton } from '@/features/create-order';
import { BuyOrderDrawer } from '@/features/buy-order';
import {
  useOrders,
  useBuyOrder,
  useMarketOrders,
  useCreateOrder,
  OrderList,
  type Order,
} from '@/entities/order';
import { MaxWidthWrapper } from '@/shared/ui/max-width-wrapper';
import { useToast } from '@/shared/ui/toast';

export const IndexPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: marketOrders, isLoading: marketLoading } = useMarketOrders();
  const buyOrderMutation = useBuyOrder();
  const createOrderMutation = useCreateOrder();
  const { showToast } = useToast();

  const handleOrderBuy = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBuyOrderSubmit = (data: { regularTonAmount: number; instantBpAmount: number }) => {
    if (!selectedOrder) {
      return;
    }
    buyOrderMutation.mutate(
      {
        order_id: selectedOrder.id,
        ton_amount: data.regularTonAmount,
      },
      {
        onSuccess: () => {
          setSelectedOrder(null);
          showToast('Ордер успешно куплен', 'success');
        },
        onError: () => showToast('Не удалось купить ордер', 'error'),
      }
    );
  };

  const handleCreateOrder = (data: { bp_amount: number }) => {
    createOrderMutation.mutate(
      { bp_amount: data.bp_amount },
      {
        onSuccess: () => showToast('Ордер успешно создан', 'success'),
        onError: () => showToast('Не удалось создать ордер', 'error'),
      }
    );
  };

  return (
    <Tabs defaultTab="market">
      <div className="pt-4">
        <MaxWidthWrapper>
          <TabList className="mb-3 flex gap-1">
            <Tab
              value="market"
              className="text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white"
            >
              Рынок
            </Tab>
            <Tab
              value="orders"
              className="text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white"
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

      {selectedOrder && (
        <BuyOrderDrawer
          open={Boolean(selectedOrder)}
          lotId={selectedOrder.id}
          defaultRegularTonAmount={selectedOrder.current_ton_amount}
          defaultInstantBpAmount={Math.floor(selectedOrder.current_ton_amount * 0.85)}
          isSubmitting={buyOrderMutation.isPending}
          onClose={() => setSelectedOrder(null)}
          onSubmit={handleBuyOrderSubmit}
        />
      )}
    </Tabs>
  );
};
