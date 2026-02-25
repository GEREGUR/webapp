import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { LazyMotion, m, domAnimation } from 'motion/react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useCreateOrder } from '@/entities/order';
import BpIcon from '@/shared/assets/bp.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';
import Arrow from '@/shared/assets/arrow.svg?react';

interface CreateOrderModalProps {
  open: boolean;
  bpBalance: number;
  onClose: () => void;
}

const CreateOrderModal = ({ open, bpBalance, onClose }: CreateOrderModalProps) => {
  const createOrderMutation = useCreateOrder();
  const [bpAmount, setBpAmount] = useState('');
  const [tonAmount, setTonAmount] = useState('');

  useEffect(() => {
    if (!open) {
      setBpAmount('');
      setTonAmount('');
    }
  }, [open]);

  const handleBpAmountChange = (value: string) => {
    const numValue = Number(value) || 0;
    setBpAmount(value);
    setTonAmount(String(numValue * 0.2));
  };

  const handleMaxClick = () => {
    setBpAmount(String(Math.floor(bpBalance)));
    setTonAmount(String(Math.floor(bpBalance) * 0.2));
  };

  const handleSubmit = () => {
    const bp = Number(bpAmount);
    if (isNaN(bp) || bp <= 0 || bp > bpBalance) {
      return;
    }
    createOrderMutation.mutate(
      { bp_amount: bp },
      {
        onSuccess: () => {
          setBpAmount('');
          setTonAmount('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setBpAmount('');
    setTonAmount('');
    onClose();
  };

  const isValid = Number(bpAmount) > 0 && Number(bpAmount) <= bpBalance;
  const isSubmitting = createOrderMutation.isPending;

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DrawerContent className="mx-auto rounded-t-[30px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
              Создать ордер
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
            После создания предложение станет доступно для покупки другими пользователями, вы
            сможете выкупить его досрочно в разделе &quot;Мои ордеры&quot;
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-[20px] pb-[35px]">
          <div className="grid grid-cols-1 gap-1">
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-[16.72px] leading-[18.39px] font-normal text-white">
                  Введите количество BP
                </span>
                <span className="text-xs text-white/60">Доступно: {bpBalance} BP</span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BpIcon className="size-5 text-[#C37CE2]" />
                </div>
                <Input
                  value={bpAmount}
                  onChange={(e) => handleBpAmountChange(e.target.value)}
                  placeholder="0"
                  className="rounded-[10px] bg-[#232027] pr-12 pl-10 text-center text-white placeholder:text-white/40 focus:placeholder:text-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute inset-y-1 right-1 rounded-[8px] px-3 text-xs font-medium text-white hover:bg-[#3a3a42]"
                  onClick={handleMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center pr-1">
              <Arrow className="rotate-180" />
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
                  value={tonAmount}
                  placeholder="0"
                  disabled
                  className="rounded-[10px] bg-[#232027] pr-10 pl-10 text-center text-white placeholder:text-white/40 focus:placeholder:text-transparent"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="mb-3 text-center text-sm font-semibold text-[#FFE88B]">
              Подтвердите создание предложения
            </p>

            <div className="flex gap-[22px]">
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
                type="button"
                className="flex-1 bg-[#7a9be8] hover:bg-[#8facf2] disabled:bg-[#5F81D8]"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface CreateOrderButtonProps {
  bpBalance: number;
}

export const CreateOrderButton = ({ bpBalance }: CreateOrderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center pt-2"
      >
        <Button
          onClick={() => setOpen(true)}
          className="bg-blue-dark h-[50px] w-[214px] text-[16px] font-medium"
        >
          Создать предложение
        </Button>
      </m.div>
      <CreateOrderModal open={open} bpBalance={bpBalance} onClose={() => setOpen(false)} />
    </LazyMotion>
  );
};
