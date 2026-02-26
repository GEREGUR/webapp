import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { cn, parseNumberInput } from '@/shared/lib/utils';
import { useBuyOrder } from '@/entities/order';
import TonIcon from '@/shared/assets/ton.svg?react';

interface BuyOrderDrawerProps {
  open: boolean;
  lotId: number;
  tonBalance: number;
  orderType: 'instant' | 'regular';
  defaultRegularTonAmount?: number;
  defaultInstantBpAmount?: number;
  onClose: () => void;
}

export const BuyOrderDrawer = ({
  open,
  lotId,
  tonBalance,
  orderType,
  defaultRegularTonAmount,
  defaultInstantBpAmount,
  onClose,
}: BuyOrderDrawerProps) => {
  const buyOrderMutation = useBuyOrder();
  const [regularTonAmount, setRegularTonAmount] = useState('');
  const [instantBpAmount, setInstantBpAmount] = useState('');

  useEffect(() => {
    if (!open) {
      setRegularTonAmount('');
      setInstantBpAmount('');
      return;
    }

    setRegularTonAmount(defaultRegularTonAmount?.toString() ?? '');
    setInstantBpAmount(defaultInstantBpAmount?.toString() ?? '');
  }, [open, defaultRegularTonAmount, defaultInstantBpAmount]);

  const handleRegularTonChange = (value: string) => {
    const parsedValue = parseNumberInput(value);
    const ton = Number(parsedValue) || 0;
    setRegularTonAmount(parsedValue);
    setInstantBpAmount(String(Math.floor(ton * 0.85)));
  };

  const handleMaxClick = () => {
    const maxTon = Math.min(tonBalance, defaultRegularTonAmount ?? 0);
    setRegularTonAmount(String(maxTon));
    setInstantBpAmount(String(Math.floor(maxTon * 0.85)));
  };

  const handleSubmit = () => {
    const ton = Number(regularTonAmount);
    if (isNaN(ton) || ton <= 0 || ton > tonBalance) {
      return;
    }

    buyOrderMutation.mutate(
      {
        order_id: lotId,
        ton_amount: ton,
      },
      {
        onSuccess: () => {
          setRegularTonAmount('');
          setInstantBpAmount('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setRegularTonAmount('');
    setInstantBpAmount('');
    onClose();
  };

  const isValid = Number(regularTonAmount) > 0 && Number(regularTonAmount) <= tonBalance;
  const isSubmitting = buyOrderMutation.isPending;

  const title = orderType === 'instant' ? `Мгновенный выкуп #${lotId}` : `Обычный выкуп #${lotId}`;
  const description =
    orderType === 'instant'
      ? 'После выкупа собственного предложения на ваш баланс будет зачислен TON с удержанием комиссии (15%) за мгновенную ликвидность.'
      : 'После выкупа ордера вы получите TON по указанному курсу.';

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
              {title}
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-white hover:bg-white/10"
              onClick={handleClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
          <DrawerDescription className="font-sans text-[13px] leading-[18.4px] font-light text-balance text-white/60">
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-light text-white">
                  {orderType === 'regular' ? 'Вы получите' : 'Получите обычным выкупом'}
                </span>
                {orderType === 'instant' && (
                  <span className="text-xs text-white/60">
                    Доступно: {tonBalance.toFixed(2)} TON
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TonIcon className="size-5 text-white" />
                </div>
                {orderType === 'regular' ? (
                  <>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={regularTonAmount}
                      onChange={(e) => handleRegularTonChange(e.target.value)}
                      placeholder={`Не более ${defaultRegularTonAmount}`}
                      className="rounded-[10px] bg-[#232027] pr-10 pl-10 text-center text-[20px] text-white placeholder:text-white/40 focus:placeholder:text-transparent"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute inset-y-1 right-1 rounded-[8px] px-2 text-xs font-medium text-white hover:bg-[#3a3a42] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleMaxClick}
                      disabled={tonBalance <= 0}
                    >
                      MAX
                    </Button>
                  </>
                ) : (
                  <div className="flex h-14 items-center justify-center rounded-[10px] bg-[#232027] pr-4 pl-12">
                    <span className="text-center text-[20px] text-white">
                      {defaultRegularTonAmount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-light text-white">
                  {orderType === 'regular' ? 'Вы получите сейчас' : 'Получите прямо сейчас'}
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TonIcon className="size-5" />
                </div>
                <div
                  className={cn(
                    'flex h-14 items-center justify-center rounded-[10px] bg-[#232027] pr-10 pl-12',
                    orderType === 'instant' && 'pointer-events-none'
                  )}
                >
                  <span className="text-center text-[20px] text-[#A6FF8B]">
                    {orderType === 'regular' ? defaultInstantBpAmount : instantBpAmount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="mb-3 text-center text-sm font-medium text-balance text-[#FFE88B]">
              Подтвердите выкуп предложения, данное действие невозможно отменить.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#5F81D8] hover:bg-[#7a9be8] active:bg-[#4a6fc0] disabled:bg-[#5F81D8]"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Выкуп...' : 'Подтвердить'}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
