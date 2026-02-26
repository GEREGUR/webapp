import { type FC, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer';
import { Input } from '@/shared/ui/input';
import { useToast } from '@/shared/ui/toast';
import { useWalletHistory, useWithdraw } from '@/entities/user';
import { parseNumberInput } from '@/shared/lib/utils';
import TonIcon from '@/shared/assets/ton.svg?react';
import BpPointsIcon from '@/shared/assets/bp-points-sm.svg?react';
import { Copy, X } from 'lucide-react';
import Arrow from '@/shared/assets/arrow-sm.svg?react';
import HistoryIcon from '@/shared/assets/history.svg?react';

interface DepositDrawerProps {
  open: boolean;
  walletAddress: string;
  memo: string;
  onClose: () => void;
}

type DepositDrawer = (props: DepositDrawerProps) => React.ReactElement;

export const DepositDrawer: DepositDrawer = ({ open, walletAddress, memo, onClose }) => {
  const { showToast } = useToast();

  const handleCopy = (value: string, label: string) => {
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        showToast(`${label} скопирован`, 'success');
      })
      .catch(() => {
        showToast('Не удалось скопировать', 'error');
      });
  };

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-4 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
              Пополнение баланса
            </DrawerTitle>
            <Button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent p-0 text-white"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
          <DrawerDescription className="font-sans text-[15px] leading-[18.4px] font-light text-balance text-white/60">
            Для пополнения баланса совершите перевод с нужным количеством монеты TON в сети TON на
            ниже указанный адрес с указанным MEMO.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3.5 px-4 pb-5">
          <div>
            <p className="mb-2 text-[12px] font-semibold text-white">Адрес кошелька</p>
            <div className="mb-2 flex h-[40px] items-center rounded-[12px] bg-[#232027] px-4 text-[12px] font-medium text-white">
              <span className="w-full truncate">{walletAddress}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex h-[40px] w-full items-center justify-center rounded-[12px] bg-[#45414F] text-[15px] font-semibold text-white hover:brightness-110"
              onClick={() => handleCopy(walletAddress, 'Адрес')}
            >
              <Copy className="mr-2 h-4 w-4 stroke-2" />
              Скопировать адрес
            </Button>
          </div>

          <div className="pt-1">
            <p className="mb-2 text-[12px] font-semibold text-white">MEMO</p>
            <div className="mb-2 flex h-[40px] items-center justify-center rounded-[12px] bg-[#232027] px-4 text-[16px] font-semibold text-white">
              {memo}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex h-[40px] w-full items-center justify-center rounded-[12px] bg-[#45414F] text-[15px] font-semibold text-white hover:brightness-110"
              onClick={() => handleCopy(memo, 'MEMO')}
            >
              <Copy className="mr-2 h-4 w-4 stroke-2" />
              Скопировать MEMO
            </Button>
          </div>

          <div className="space-y-2 pt-1 text-center text-[13px] leading-[1.1] font-normal text-[#FFD700]">
            <p>Минимальная сумма пополнения: 1 TON</p>
            <p>
              Отправка другой монеты в другой сети без корректного MEMO приведёт к безвозвратной
              потере средств.
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface WithdrawDrawerProps {
  open: boolean;
  maxTon: number;
  onClose: () => void;
}

type WithdrawDrawer = (props: WithdrawDrawerProps) => React.ReactElement;

export const WithdrawDrawer: WithdrawDrawer = ({ open, maxTon, onClose }) => {
  const { showToast } = useToast();
  const withdrawMutation = useWithdraw();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSetMax = () => {
    setAmount(maxTon.toString());
  };

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      showToast('Введите корректную сумму TON', 'error');
      return;
    }

    if (!address.trim()) {
      showToast('Введите адрес кошелька', 'error');
      return;
    }

    withdrawMutation.mutate(
      { amount: Number(amount), address },
      {
        onSuccess: () => {
          onClose();
          setAmount('');
          setAddress('');
          showToast('Заявка на вывод отправлена', 'success');
        },
        onError: () => {
          showToast('Не удалось отправить заявку на вывод', 'error');
        },
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-2.5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
              Вывод баланса
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent p-0 text-white"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
          <DrawerDescription className="font-sans text-[13px] leading-[18.4px] font-light text-balance text-white/60">
            Для вывода баланса укажите нужное количество TON и адрес кошелька в сети TON.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3.5 px-4 pb-5">
          <div>
            <p className="mb-2 text-[15px] font-semibold text-white">Введите количество TON</p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <TonIcon className="h-4 w-4" />
              </div>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAmount(parseNumberInput(event.target.value))}
                placeholder={`Не более ${maxTon}`}
                className="h-[50px] rounded-[12px] border-none bg-[#232027] pr-14 pl-10 text-center text-[20px] font-medium text-white placeholder:text-white/40"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 text-[14px] font-semibold text-white"
                onClick={handleSetMax}
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[15px] font-semibold text-white">
              Введите адрес кошелька в сети TON
            </p>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Введите сюда адрес"
              className="h-[50px] rounded-[12px] border-none bg-[#232027] text-center text-[18px] font-medium text-white placeholder:text-white/40"
            />
          </div>

          <p className="pt-[45px] pb-[23px] text-center text-[14px] leading-[1.1] font-semibold text-[#FFE88B]">
            Подтвердите вывод средств, данное действие невозможно отменить.
          </p>

          <div className="flex gap-[22px]">
            <Button
              type="button"
              variant="secondary"
              className="h-[46px] flex-1 rounded-[12px] bg-[#2F3033] text-[15px] font-semibold text-white"
              onClick={onClose}
            >
              Закрыть
            </Button>
            <Button
              type="button"
              className="h-[46px] flex-1 rounded-[12px] bg-[#5F81D8] text-[15px] font-semibold text-white hover:brightness-110"
              onClick={handleSubmit}
            >
              Вывести
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface WalletHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

type WalletHistoryDrawer = (props: WalletHistoryDrawerProps) => React.ReactElement;

export const WalletHistoryDrawer: WalletHistoryDrawer = ({ open, onClose }) => {
  const { data: items, isLoading, error } = useWalletHistory();

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-2.5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-2xl leading-[22.32px] font-medium text-white">
              История кошелька
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent p-0 text-white"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="max-h-[66vh] space-y-2 overflow-y-auto px-4 pb-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-white/60">Не удалось загрузить историю</p>
          ) : items?.length === 0 ? (
            <p className="py-8 text-center text-white/60">История пуста</p>
          ) : (
            items?.map((item) => {
              const isPositive = item.amount >= 0;
              return (
                <div
                  key={item.id}
                  className="flex h-[56px] items-center justify-between rounded-[12px] bg-[#232027] px-3"
                >
                  <div className="flex min-w-[76px] items-center gap-1">
                    {item.currency === 'TON' ? (
                      <TonIcon className="h-4 w-4" />
                    ) : (
                      <BpPointsIcon className="h-4 w-4" />
                    )}
                    <span
                      className={`text-[18px] leading-none font-medium ${isPositive ? 'text-[#A6FF8B]' : 'text-[#FF6363]'}`}
                    >
                      {isPositive ? '+' : '-'}
                      {Math.abs(item.amount)}
                    </span>
                  </div>
                  <p className="flex-1 px-2 text-center text-[14px] font-normal text-white">
                    {item.title}
                  </p>
                  <span className="text-[12px] font-medium text-white">{item.date}</span>
                </div>
              );
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface WalletCardProps {
  tonBalance: number;
  internalBalance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export const WalletCard: FC<WalletCardProps> = ({
  tonBalance,
  internalBalance,
  onDeposit,
  onWithdraw,
  onHistory,
  onConnectWallet,
  isWalletConnected,
  walletAddress,
}) => {
  return (
    <Card className="relative z-10 mx-auto flex h-[195px] w-full max-w-[370px] flex-col justify-between rounded-[10px] border border-[#272525] !bg-[#131214] p-4 opacity-100">
      <div className="rounded-[16px] border-[1.5px] border-[#272525] !bg-[#131214] p-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-[64px] items-center justify-center gap-1 rounded-[12px] bg-[#232027] px-2.5 py-2">
            <TonIcon className="h-4 w-4" />
            <span className="text-[14px] leading-none font-normal text-white">
              {tonBalance.toLocaleString()}
            </span>
          </div>
          <p className="text-center text-[14px] leading-none font-medium text-white">Баланс</p>
          <div className="flex min-w-[64px] items-center justify-center gap-1 rounded-[12px] bg-[#232027] px-2.5 py-2">
            <BpPointsIcon className="h-4 w-4" />
            <span className="text-[14px] leading-none font-normal text-white">
              {internalBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-[41px] items-center justify-center rounded-[12px] bg-[#2F3033] text-[13px] font-semibold text-white hover:brightness-110"
          onClick={onDeposit}
        >
          <Arrow className="mr-1 size-3" />
          Внести
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-[41px] items-center justify-center rounded-[12px] bg-[#2F3033] text-[13px] font-semibold text-white hover:brightness-110"
          onClick={onWithdraw}
        >
          <Arrow className="mr-1 size-3 rotate-180" />
          Вывести
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="inline-flex h-[40px] flex-1 items-center justify-center gap-1 rounded-[12px] bg-white text-[13px] font-semibold text-black hover:bg-white/90"
          onClick={onConnectWallet}
        >
          <svg className="size-[14px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          {isWalletConnected && walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Подключить кошелек'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-[40px] w-[60px] items-center justify-center rounded-[12px] bg-[#2F3033] p-0 text-white hover:brightness-110"
          aria-label="История"
          onClick={onHistory}
        >
          <HistoryIcon className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};
