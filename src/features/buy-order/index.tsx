import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import BpIcon from '@/shared/assets/bp.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';

const buyOrderSchema = z.object({
  regularTonAmount: z.string().min(1, 'Введите значение TON'),
  instantBpAmount: z.string().min(1, 'Введите значение BP'),
});

interface BuyOrderFormData {
  regularTonAmount: string;
  instantBpAmount: string;
}

interface BuyOrderDrawerProps {
  open: boolean;
  lotId: number;
  defaultRegularTonAmount?: number;
  defaultInstantBpAmount?: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: { regularTonAmount: number; instantBpAmount: number }) => void;
}

export const BuyOrderDrawer = ({
  open,
  lotId,
  defaultRegularTonAmount,
  defaultInstantBpAmount,
  isSubmitting = false,
  onClose,
  onSubmit,
}: BuyOrderDrawerProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuyOrderFormData>({
    resolver: zodResolver(buyOrderSchema),
    defaultValues: {
      regularTonAmount: defaultRegularTonAmount?.toString() ?? '',
      instantBpAmount: defaultInstantBpAmount?.toString() ?? '',
    },
  });
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({
      regularTonAmount: defaultRegularTonAmount?.toString() ?? '',
      instantBpAmount: defaultInstantBpAmount?.toString() ?? '',
    });
  }, [open, defaultRegularTonAmount, defaultInstantBpAmount, reset]);

  const onFormSubmit = (data: BuyOrderFormData) => {
    setIsLocalSubmitting(true);
    try {
      onSubmit({
        regularTonAmount: Number(data.regularTonAmount),
        instantBpAmount: Number(data.instantBpAmount),
      });
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader>
          <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
            Мгновенный выкуп #{lotId}
          </DrawerTitle>
          <DrawerDescription className="font-sans text-[15px] leading-[18.4px] font-light text-white/60">
            После выкупа собственного предложения на ваш баланс будет зачислен TON с удержанием
            комиссии (15%) за мгновенную ликвидность.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={(event) => {
            void handleSubmit(onFormSubmit)(event);
          }}
          className="space-y-4 px-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-normal text-white">
                  Получите обычным выкупом
                </span>
                <div className="flex items-center gap-1">
                  <TonIcon className="size-3 text-white" />
                  <span className="font-sans text-xs font-normal text-white">1</span>
                  <span className="font-sans text-xs font-normal text-white">=</span>
                  <BpIcon className="size-4 text-[#C37CE2]" />
                  <span className="font-sans text-xs font-normal text-white">1</span>
                </div>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TonIcon className="size-5 text-white" />
                </div>
                <Input
                  {...register('regularTonAmount')}
                  placeholder="0"
                  className="rounded-[10px] bg-[#232027] pl-10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-normal text-white">
                  Получите прямо сейчас
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BpIcon className="size-5 text-[#C37CE2]" />
                </div>
                <Input
                  {...register('instantBpAmount')}
                  placeholder="0"
                  className="rounded-[10px] bg-[#232027] pl-10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>

          {(errors.regularTonAmount || errors.instantBpAmount) && (
            <p className="text-sm text-red-400">
              {errors.regularTonAmount?.message || errors.instantBpAmount?.message}
            </p>
          )}

          <div className="pt-2">
            <p className="mb-3 text-center text-sm font-medium text-[#FFE88B]">
              Подтвердите выкуп предложения, данное действие невозможно отменить.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting || isLocalSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#7a9be8] hover:bg-[#8facf2] disabled:bg-[#5F81D8]"
                disabled={isSubmitting || isLocalSubmitting}
              >
                {isSubmitting || isLocalSubmitting ? 'Выкуп...' : 'Подтвердить'}
              </Button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
