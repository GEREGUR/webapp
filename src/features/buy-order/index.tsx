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
import { Loader } from '@/shared/ui/spinner';
import { cn, formatFloat, parseNumberInput } from '@/shared/lib/utils';
import { useBuyOrder, useSelfBuyOrder, useOrderInfo, type OrderSettings } from '@/entities/order';
import TonIcon from '@/shared/assets/ton.svg?react';
import ArrowIcon from '@/shared/assets/arrow.svg?react';
import BpPointsIcon from '@/shared/assets/bp-points-sm.svg?react';

interface BuyOrderDrawerProps {
  open: boolean;
  lotId: number;
  tonBalance: number;
  orderType: 'instant' | 'regular';
  currentTonAmount: number;
  settings?: OrderSettings;
  onClose: () => void;
}

export const BuyOrderDrawer = ({
  open,
  lotId,
  tonBalance,
  orderType,
  currentTonAmount,
  settings,
  onClose,
}: BuyOrderDrawerProps) => {
  const buyOrderMutation = useBuyOrder();
  const selfBuyOrderMutation = useSelfBuyOrder();
  const { data: orderInfo, isLoading: isOrderInfoLoading } = useOrderInfo(lotId);
  const [regularTonAmount, setRegularTonAmount] = useState('');

  console.log(settings, 'настройки');
  console.log(orderInfo, 'инфо');

  const isInstant = orderType === 'instant';
  const currentMutation = isInstant ? selfBuyOrderMutation : buyOrderMutation;

  const minBuyAmount = orderInfo?.min_buy_amount ?? 0;
  const selfBuyTonAmount = orderInfo?.self_buy_ton_amount ?? currentTonAmount;

  const payTonAmount = isInstant ? currentTonAmount : Number(regularTonAmount);
  const receiveTonAmount = isInstant ? selfBuyTonAmount : payTonAmount * (settings?.rate ?? 0);
  const maxBuyAmount = currentTonAmount - minBuyAmount;

  const handleRegularTonChange = (value: string) => {
    const parsedValue = parseNumberInput(value);
    setRegularTonAmount(parsedValue);
  };

  const handleMaxClick = () => {
    const maxTon = Math.min(tonBalance, maxBuyAmount > 0 ? maxBuyAmount : currentTonAmount);
    setRegularTonAmount(String(maxTon));
  };

  const handleSubmit = () => {
    if (isInstant) {
      selfBuyOrderMutation.mutate(lotId, {
        onSuccess: () => {
          onClose();
        },
      });
      return;
    }

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
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setRegularTonAmount('');
    onClose();
  };

  const isValid = isInstant
    ? payTonAmount <= tonBalance
    : Number(regularTonAmount) > 0 &&
      Number(regularTonAmount) <= tonBalance &&
      Number(regularTonAmount) <= (maxBuyAmount > 0 ? maxBuyAmount : currentTonAmount);

  const isSubmitting = currentMutation.isPending;

  const title = isInstant ? `Мгновенный выкуп #${lotId}` : `Покупка ордера #${lotId}`;
  const feePercentage = settings?.fee_self_buy ?? 15;
  const description = isInstant
    ? `После выкупа собственного предложения на ваш баланс будет зачислен TON с удержанием комиссии (${feePercentage}%) за мгновенную ликвидность.`
    : 'После покупки части или всего предложения на ваш баланс будет зачислена валюта BP с ее помощью вы можете создать собственное предложение.';

  useEffect(() => {
    if (!open) {
      setRegularTonAmount('');
      return;
    }
  }, [open]);

  //TODO: refactor
  if (!settings?.rate) {
    return null;
  }

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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent p-0 text-white"
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
          <div className="relative">
            <div>
              <div className="mb-0 flex items-center justify-between">
                <div className="flex w-full items-center justify-between gap-2">
                  {/*TODO: refactor */}
                  <span
                    className={cn(
                      'font-sans text-[16.72px] leading-[18.39px] font-light text-white',
                      { 'my-1': orderType === 'instant' }
                    )}
                  >
                    {orderType === 'regular'
                      ? 'Введите количество TON'
                      : 'Получите обычным выкупом'}
                  </span>
                  {orderType === 'regular' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 font-sans">
                      <TonIcon className="size-3.5 text-white" />
                      <span className="text-[17px] font-[500] text-white">1</span>
                      <span className="mx-3 text-[17px] text-white">=</span>
                      <BpPointsIcon className="size-4" />
                      <span className="text-[17px] font-[500] text-white">{settings.rate}</span>
                    </div>
                  )}
                </div>
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
                      placeholder={`Не более ${currentTonAmount}`}
                      className="h-[40px] rounded-[10px] bg-[#232027] pr-10 pl-12 text-center text-[20px] text-white placeholder:text-white/40 focus:placeholder:text-transparent disabled:opacity-50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute inset-y-1 right-1 rounded-[8px] px-2 text-xs font-medium text-white hover:bg-[#3a3a42] disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleMaxClick}
                      disabled={tonBalance <= 0 || isOrderInfoLoading}
                    >
                      MAX
                    </Button>
                  </>
                ) : (
                  <div
                    className={cn(
                      'flex h-[40px] items-center justify-center rounded-[10px] bg-[#232027] pr-10 pl-12',
                      orderType === 'instant' && 'pointer-events-none'
                    )}
                  >
                    {isOrderInfoLoading ? (
                      <Loader size="sm" />
                    ) : (
                      <span className="text-center text-[20px] text-white">{payTonAmount}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {orderType === 'regular' && (
              <ArrowIcon className="absolute top-[calc(50%+15px)] left-[calc(50%+3px)] -translate-x-1/2 -translate-y-1/2 rotate-180" />
            )}

            <div className="mt-4">
              <div className="mt-1 mb-1.5 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-light text-white">
                  {orderType === 'regular' ? 'Получите BP' : 'Получите прямо сейчас'}
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  {orderType === 'regular' ? (
                    <BpPointsIcon className="size-5" />
                  ) : (
                    <TonIcon className="size-5" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-[40px] items-center justify-center rounded-[10px] bg-[#232027] pr-10 pl-12',
                    orderType === 'instant' && 'pointer-events-none'
                  )}
                >
                  {isOrderInfoLoading ? (
                    <Loader size="sm" className="text-[#A6FF8B]" />
                  ) : (
                    <span className="text-center text-[20px] text-[#A6FF8B]">
                      {orderType === 'regular'
                        ? formatFloat(Number(regularTonAmount) * (settings?.rate ?? 0), 3)
                        : formatFloat(receiveTonAmount, 3)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <p className="mb-3 text-center text-sm font-medium text-balance text-[#FFE88B]">
              {orderType === 'regular' ? (
                <>
                  Подтвердите выкуп предложения,
                  <br />
                  данное действие невозможно отменить.
                </>
              ) : (
                <>Подтвердите покупку предложения, данное действие невозможно отменить.</>
              )}
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
