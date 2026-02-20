import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';
import { Slider } from '@/shared/ui/slider';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { OrderCard } from '@/shared/ui/order-card';
import { CreateOrderForm } from '@/shared/ui/create-order-form';
import { useOrders } from '@/entities/order';

export const IndexPage = () => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders();

  const handleBuy = () => {
    setIsLoading(true);
    console.log('Buy', sliderValue[0], 'TON');
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleOrderBuy = (orderId: number) => {
    console.log('Buy from order', orderId);
  };

  return (
    <Tabs defaultTab="market">
      <TabList className="mb-4 flex gap-1 p-1">
        <Tab
          value="market"
          className="flex-1 rounded px-4 py-2 text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
        >
          Купить
        </Tab>
        <Tab
          value="create"
          className="flex-1 rounded px-4 py-2 text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
        >
          Продать
        </Tab>
        <Tab
          value="orders"
          className="flex-1 rounded px-4 py-2 text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
        >
          Мои ордера
        </Tab>
      </TabList>

      <TabPanel value="market">
        <Card className="mb-4">
          <h3 className="mb-2 font-semibold text-white">Купить TON</h3>
          <p className="mb-4 text-sm text-white/60">Выберите количество TON для покупки</p>
          <Slider value={sliderValue} onValueChange={setSliderValue} min={1} max={1000} step={1} />
          <p className="mt-4 text-center text-lg text-white">{sliderValue[0]} TON</p>
        </Card>

        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Курс</span>
            <span className="text-white">5.25 BP за 1 TON</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/60">Итого</span>
            <span className="text-white">{(sliderValue[0] * 5.25).toFixed(2)} BP</span>
          </div>
        </Card>

        <Button onClick={handleBuy} disabled={isLoading} className="w-full">
          {isLoading ? 'Покупка...' : 'Купить'}
        </Button>
      </TabPanel>

      <TabPanel value="create">
        <CreateOrderForm
          onSuccess={() => {
            void refetch();
          }}
        />
      </TabPanel>

      <TabPanel value="orders">
        {ordersLoading ? (
          <Card>
            <p className="text-center text-white/60">Загрузка...</p>
          </Card>
        ) : orders && orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order.id} order={order} onBuy={handleOrderBuy} />)
        ) : (
          <Card>
            <p className="text-center text-white/60">У вас пока нет ордеров</p>
          </Card>
        )}
      </TabPanel>
    </Tabs>
  );
};
