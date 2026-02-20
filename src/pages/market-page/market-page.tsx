import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Card } from '@/shared/ui/card';
import { OrderCard } from '@/shared/ui/order-card';
import { useMarketOrders } from '@/entities/order';
import { Spinner } from '@/shared/ui/spinner';

export const MarketPage: FC = () => {
  const { data: orders, isLoading } = useMarketOrders();

  return (
    <Page back>
      <h1 className="mb-4 text-xl font-bold text-white">Рынок</h1>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : orders && orders.length > 0 ? (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      ) : (
        <Card>
          <p className="text-center text-white/60">На рынке нет ордеров</p>
        </Card>
      )}
    </Page>
  );
};
