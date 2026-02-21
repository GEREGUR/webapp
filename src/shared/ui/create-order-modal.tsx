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
} from '@/components/ui/drawer';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import BpIcon from '@/shared/assets/bp.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';

const createOrderSchema = z.object({
  bpAmount: z.number().min(1, 'Минимум 1 BP'),
  tonAmount: z.number().min(1, 'Минимум 1 TON'),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderFormData) => void;
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
      bpAmount: 0,
      tonAmount: 0,
    },
  });

  const onFormSubmit = async (data: CreateOrderFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
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
    <Drawer open={open} onClose={handleClose}>
      <DrawerContent className="mx-auto sm:max-w-[400px]">
        <DrawerHeader>
          <DrawerTitle>Создать ордер</DrawerTitle>
          <DrawerDescription>
            После создания предложение станет доступно для покупки другими пользователями, вы
            сможете выкупить его досрочно в разделе "Мои ордеры"
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BpIcon className="size-5 text-white" />
              </div>
              <Input
                {...register('bpAmount', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className="pl-10"
              />
            </div>

            <div className="flex justify-center">
              <svg
                className="size-5 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <TonIcon className="size-5 text-white" />
              </div>
              <Input
                {...register('tonAmount', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className="pl-10"
              />
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
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
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

  const handleSubmit = (data: CreateOrderFormData) => {
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
