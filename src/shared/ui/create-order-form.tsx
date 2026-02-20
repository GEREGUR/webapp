import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Slider } from '@/shared/ui/slider';
import { Spinner } from '@/shared/ui/spinner';
import { useToast } from '@/shared/ui/toast';
import { useCreateOrder } from '@/entities/order';

export const CreateOrderForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [bpAmount, setBpAmount] = useState([100]);
  const [tonAmount, setTonAmount] = useState([10]);
  const { showToast } = useToast();

  const createOrder = useCreateOrder();

  const handleSubmit = () => {
    createOrder.mutate(
      { bp_amount: bpAmount[0] },
      {
        onSuccess: () => {
          showToast('Ордер создан!', 'success');
          onSuccess?.();
        },
        onError: () => {
          showToast('Ошибка создания ордера', 'error');
        },
      }
    );
  };

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-white">Создать ордер</h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-white/60">Количество BP</label>
        <Slider value={bpAmount} onValueChange={setBpAmount} min={10} max={10000} step={10} />
        <p className="mt-2 text-center text-white">{bpAmount[0]} BP</p>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-white/60">Получить TON</label>
        <Slider value={tonAmount} onValueChange={setTonAmount} min={1} max={1000} step={1} />
        <p className="mt-2 text-center text-white">{tonAmount[0]} TON</p>
      </div>

      <div className="mb-4 flex justify-between text-sm">
        <span className="text-white/60">Курс</span>
        <span className="text-white">{(bpAmount[0] / tonAmount[0]).toFixed(2)} BP за 1 TON</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={createOrder.isPending}
        className="w-full"
        variant="secondary"
      >
        {createOrder.isPending ? <Spinner size="sm" /> : 'Создать ордер'}
      </Button>
    </Card>
  );
};
