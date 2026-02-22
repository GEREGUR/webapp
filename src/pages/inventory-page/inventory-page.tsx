import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Card } from '@/shared/ui/card';
import { Loader } from '@/shared/ui/spinner';
import { useInventory } from '@/entities/inventory';

const rarityColors = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

export const InventoryPage: FC = () => {
  const { data, isLoading } = useInventory();

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  return (
    <Page back>
      <h1 className="mb-4 text-xl font-bold text-white">Инвентарь</h1>

      {data && data.items.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {data.items.map((item) => (
            <Card
              key={item.id}
              className={`border-2 ${rarityColors[item.rarity]} flex flex-col items-center p-2`}
            >
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-12 w-12 object-contain" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <p className="w-full truncate text-center text-xs font-medium text-white">
                {item.name}
              </p>
              <p className="text-xs text-white/60">x{item.quantity}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-white/60">Ваш инвентарь пуст</p>
        </Card>
      )}
    </Page>
  );
};
