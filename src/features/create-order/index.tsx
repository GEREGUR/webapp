import { useState } from 'react';
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

const createOrderSchema = z.object({
  bpAmount: z.string().min(1, 'Минимум 1 BP'),
  tonAmount: z.string().min(1, 'Минимум 1 TON'),
});

interface CreateOrderFormData {
  bpAmount: string;
  tonAmount: string;
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { bpAmount: number; tonAmount: number }) => void;
}

export const CreateOrderModal = ({ open, onClose, onSubmit }: CreateOrderModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      bpAmount: '',
      tonAmount: '',
    },
  });

  const onFormSubmit = (data: CreateOrderFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit({
        bpAmount: Number(data.bpAmount),
        tonAmount: Number(data.tonAmount),
      });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
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
            Создать ордер
          </DrawerTitle>
          <DrawerDescription className="font-sans text-[15px] leading-[18.4px] font-light text-white/60">
            После создания предложение станет доступно для покупки другими пользователями, вы
            сможете выкупить его досрочно в разделе "Мои ордеры"
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
                  Введите количество BP
                </span>
                <div className="flex items-center gap-1">
                  <BpIcon className="size-4 text-[#C37CE2]" />
                  <TonIcon className="size-4 text-white" />
                  <span className="font-sans text-xs font-normal text-white">= 1 TON</span>
                </div>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BpIcon className="size-5 text-[#C37CE2]" />
                </div>
                <Input
                  {...register('bpAmount')}
                  placeholder="0"
                  className="rounded-[10px] bg-[#232027] pl-10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <svg
                className="size-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>

            <div className="relative">
              <span className="mb-2 block font-sans text-[16.72px] leading-[18.39px] font-normal text-white">
                Получите TON
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TonIcon className="size-5 text-white" />
                </div>
                <Input
                  {...register('tonAmount')}
                  placeholder="0"
                  className="rounded-[10px] bg-[#232027] pl-10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>

          {(errors.bpAmount || errors.tonAmount) && (
            <p className="text-sm text-red-400">
              {errors.bpAmount?.message || errors.tonAmount?.message}
            </p>
          )}

          <div className="pt-2">
            <p className="mb-3 text-center text-sm font-medium text-white">
              Подтвердите создание предложения
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Закрыть
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#7a9be8] hover:bg-[#8facf2] disabled:bg-[#5F81D8]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

interface CreateOrderButtonProps {
  onSubmit: (data: { bp_amount: number }) => void;
}

export const CreateOrderButton = ({ onSubmit }: CreateOrderButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: { bpAmount: number; tonAmount: number }) => {
    onSubmit({ bp_amount: data.bpAmount });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        Создать предложение
      </Button>
      <CreateOrderModal open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
};
