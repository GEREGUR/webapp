import { type FC, useState } from 'react';
import { Page } from '@/pages/page';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer';
import { Input } from '@/shared/ui/input';
import { Loader } from '@/shared/ui/spinner';
import { useToast } from '@/shared/ui/toast';
import { useProfile } from '@/entities/user';
import TonIcon from '@/shared/assets/ton.svg?react';
import BpPointsIcon from '@/shared/assets/bp-points.svg?react';
import { ArrowDown, ArrowUp, Copy, History, UserPlus, Users, WalletMinimal, X } from 'lucide-react';

interface DepositBalanceDrawerProps {
  open: boolean;
  walletAddress: string;
  memo: string;
  onClose: () => void;
  onCopy: (value: string, label: string) => void;
}

const DepositBalanceDrawer = ({
  open,
  walletAddress,
  memo,
  onClose,
  onCopy,
}: DepositBalanceDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-2.5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-[22px] leading-[1.1] font-medium text-white">
              Пополнение баланса
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 rounded-[10px] p-0 text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
          <DrawerDescription className="font-sans text-[14px] leading-[1.2] font-light text-white/60">
            Для пополнения баланса совершите перевод с нужным количеством монеты TON в сети TON на
            ниже указанный адрес с указанным MEMO.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3.5 px-4 pb-5">
          <div>
            <p className="mb-2 text-[15px] font-semibold text-white">Адрес кошелька</p>
            <div className="mb-2 flex h-[52px] items-center rounded-[12px] bg-[#232027] px-4 text-[13px] font-medium text-white">
              <span className="w-full truncate">{walletAddress}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#45414F] text-[15px] font-semibold text-white hover:brightness-110"
              onClick={() => onCopy(walletAddress, 'Адрес')}
            >
              <Copy className="mr-2 h-4 w-4 stroke-2" />
              Скопировать адрес
            </Button>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-semibold text-white">MEMO</p>
            <div className="mb-2 flex h-[52px] items-center justify-center rounded-[12px] bg-[#232027] px-4 text-[16px] font-semibold text-white">
              {memo}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex h-[50px] w-full items-center justify-center rounded-[12px] bg-[#45414F] text-[15px] font-semibold text-white hover:brightness-110"
              onClick={() => onCopy(memo, 'MEMO')}
            >
              <Copy className="mr-2 h-4 w-4 stroke-2" />
              Скопировать MEMO
            </Button>
          </div>

          <div className="space-y-2 pt-1 text-center text-[14px] leading-[1.1] font-semibold text-[#FFD700]">
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

interface WithdrawBalanceDrawerProps {
  open: boolean;
  maxTon: number;
  amount: string;
  address: string;
  onAmountChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onSetMax: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

const WithdrawBalanceDrawer = ({
  open,
  maxTon,
  amount,
  address,
  onAmountChange,
  onAddressChange,
  onSetMax,
  onClose,
  onSubmit,
}: WithdrawBalanceDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-2.5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-[22px] leading-[1.1] font-medium text-white">
              Вывод баланса
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 rounded-[10px] p-0 text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
          <DrawerDescription className="font-sans text-[14px] leading-[1.2] font-light text-white/60">
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
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder={`Не более ${maxTon}`}
                className="h-[50px] rounded-[12px] border-none bg-[#232027] pr-14 pl-10 text-[20px] font-medium text-white placeholder:text-white/40"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 text-[14px] font-semibold text-white"
                onClick={onSetMax}
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
              onChange={(event) => onAddressChange(event.target.value)}
              placeholder="Введите сюда адрес"
              className="h-[50px] rounded-[12px] border-none bg-[#232027] text-[18px] font-medium text-white placeholder:text-white/40"
            />
          </div>

          <p className="pt-1 text-center text-[14px] leading-[1.1] font-semibold text-[#FFE88B]">
            Подтвердите вывод средств, данное действие невозможно отменить.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-[46px] flex-1 rounded-[12px] bg-[#2F3033] text-[14px] font-semibold text-white"
              onClick={onClose}
            >
              Закрыть
            </Button>
            <Button
              type="button"
              className="h-[46px] flex-1 rounded-[12px] bg-[#5F81D8] text-[14px] font-semibold text-white hover:brightness-110"
              onClick={onSubmit}
            >
              Вывести
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface WalletHistoryItem {
  id: number;
  currency: 'TON' | 'BP';
  amount: number;
  title: string;
  date: string;
}

interface WalletHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  items: WalletHistoryItem[];
}

const WalletHistoryDrawer = ({ open, onClose, items }: WalletHistoryDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DrawerContent className="mx-auto rounded-t-[20px] bg-[#131214] sm:max-w-[400px]">
        <DrawerHeader className="gap-2.5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-sans text-[22px] leading-[1.1] font-medium text-white">
              История кошелька
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 rounded-[10px] p-0 text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 stroke-2" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="max-h-[66vh] space-y-2 overflow-y-auto px-4 pb-5">
          {items.map((item) => {
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
                <p className="flex-1 px-2 text-center text-[14px] font-medium text-white">
                  {item.title}
                </p>
                <span className="text-[12px] font-medium text-white">{item.date}</span>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const ProfilePage: FC = () => {
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const walletAddressForDeposit =
    profile?.wallet_address ?? 'UQBZKlyfMpa5IVenwd2v-2bcoWgmxhHLo4B_G8zKOe2lXuby';
  const depositMemo = `ID-${profile?.id ?? 7}`;
  const historyItems: WalletHistoryItem[] = [
    { id: 1, currency: 'TON', amount: 50, title: 'Выкуп ордера', date: '17.01 23:00' },
    { id: 2, currency: 'TON', amount: 50, title: 'Пополнение баланса', date: '17.01 23:00' },
    { id: 3, currency: 'TON', amount: 50, title: 'Реферальная система', date: '17.01 23:00' },
    { id: 4, currency: 'BP', amount: 50, title: 'Покупка ордера', date: '17.01 23:00' },
    { id: 5, currency: 'BP', amount: -50, title: 'Создание ордера', date: '17.01 23:00' },
    { id: 6, currency: 'BP', amount: -50, title: 'Создание ордера', date: '17.01 23:00' },
    { id: 7, currency: 'BP', amount: -50, title: 'Создание ордера', date: '17.01 23:00' },
  ];

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

  const handleWithdrawSubmit = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      showToast('Введите корректную сумму TON', 'error');
      return;
    }

    if (!withdrawAddress.trim()) {
      showToast('Введите адрес кошелька', 'error');
      return;
    }

    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
    showToast('Заявка на вывод отправлена', 'success');
  };

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page back>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-center text-white/60">Не удалось загрузить профиль</p>
        </div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="mb-6 flex flex-col items-center">
        <Avatar
          src={profile.avatar}
          alt={profile.name}
          fallback={profile.name}
          size="xl"
          className="mb-3"
        />
        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <p className="text-white/60">@{profile.username}</p>
      </div>

      <div className="mx-auto flex h-[195px] w-full max-w-[370px] flex-col justify-between rounded-[10px] border border-[#272525] bg-[#131214] p-3">
        <div className="rounded-[16px] border border-[#272525] bg-[#131214] p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-[88px] items-center justify-center gap-1 rounded-[12px] border border-[#3A373E] bg-[#232027] px-2.5 py-1.5">
              <TonIcon className="h-4 w-4" />
              <span className="text-[14px] leading-none font-medium text-white">
                {profile.ton_balance.toLocaleString()}
              </span>
            </div>
            <p className="text-center text-[18px] leading-none font-semibold text-white">Баланс</p>
            <div className="flex min-w-[88px] items-center justify-center gap-1 rounded-[12px] border border-[#3A373E] bg-[#232027] px-2.5 py-1.5">
              <BpPointsIcon className="h-4 w-4" />
              <span className="text-[14px] leading-none font-medium text-white">
                {profile.internal_balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex h-[41px] items-center justify-center rounded-[12px] bg-[#2F3033] text-[13px] font-semibold text-white hover:brightness-110"
            onClick={() => setIsDepositOpen(true)}
          >
            <ArrowDown className="mr-1 h-4 w-4 stroke-2" />
            Внести
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="inline-flex h-[41px] items-center justify-center rounded-[12px] bg-[#2F3033] text-[13px] font-semibold text-white hover:brightness-110"
            onClick={() => setIsWithdrawOpen(true)}
          >
            <ArrowUp className="mr-1 h-4 w-4 stroke-2" />
            Вывести
          </Button>
        </div>

        <div className="flex">
          <Button
            type="button"
            className="inline-flex h-[41px] flex-1 items-center justify-center rounded-[12px] bg-white text-[13px] font-semibold text-black hover:bg-white/90"
            onClick={() => showToast('Подключение кошелька в разработке', 'info')}
          >
            <WalletMinimal className="mr-1 h-4 w-4 stroke-2" />
            Подключить кошелек
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="inline-flex h-[41px] w-[41px] items-center justify-center rounded-[12px] bg-[#2F3033] p-0 text-white hover:brightness-110"
            aria-label="История"
            onClick={() => setIsHistoryOpen(true)}
          >
            <History className="h-5 w-5 stroke-2" />
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-3 flex h-[194px] w-full max-w-[370px] flex-col justify-between rounded-[10px] border border-[#272525] bg-[#131214] p-3">
        <h2 className="max-w-[300px] text-[15px] leading-[1.25] font-semibold text-balance text-white">
          Приглашайте друзей и зарабатывайте 10% от их сделок
        </h2>

        <div className="grid grid-cols-2 overflow-hidden rounded-[12px] bg-[#232027]">
          <div className="flex h-[60px] items-center justify-center gap-1 px-2">
            <span className="text-[12px] font-semibold text-white">Приглашено:</span>
            <Users className="h-4 w-4 text-[#C37CE2]" />
            <span className="text-[12px] leading-none font-semibold text-white">0</span>
          </div>
          <div className="flex h-[60px] items-center justify-center gap-1 border-l border-white/20 px-2">
            <span className="text-[12px] font-semibold text-white">Заработано:</span>
            <TonIcon className="h-4 w-4" />
            <span className="text-[12px] leading-none font-semibold text-white">
              {profile.referral_earn.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#2F3033] text-[12px] font-semibold text-white hover:brightness-110"
            onClick={() =>
              void handleCopy(
                `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/webapp?ref=${profile.id}`)}`,
                'Ссылка'
              )
            }
          >
            <Copy className="mr-1 h-4 w-4 stroke-2" />
            Скопировать
          </Button>
          <Button
            type="button"
            className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#5F81D8] text-[12px] font-semibold text-white hover:brightness-110"
            onClick={() => showToast('Инвайт отправлен', 'success')}
          >
            <UserPlus className="mr-1 h-4 w-4 stroke-2" />
            Пригласить
          </Button>
        </div>
      </div>

      {profile.wallet_address && (
        <div className="mx-auto mt-3 w-full max-w-[370px] rounded-[10px] border border-[#272525] bg-[#131214] p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-white/60">Кошелек</span>
            <span className="text-sm font-medium text-white">
              {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
            </span>
          </div>
        </div>
      )}

      <DepositBalanceDrawer
        open={isDepositOpen}
        walletAddress={walletAddressForDeposit}
        memo={depositMemo}
        onClose={() => setIsDepositOpen(false)}
        onCopy={handleCopy}
      />

      <WithdrawBalanceDrawer
        open={isWithdrawOpen}
        maxTon={profile.ton_balance}
        amount={withdrawAmount}
        address={withdrawAddress}
        onAmountChange={setWithdrawAmount}
        onAddressChange={setWithdrawAddress}
        onSetMax={() => setWithdrawAmount(profile.ton_balance.toString())}
        onClose={() => setIsWithdrawOpen(false)}
        onSubmit={handleWithdrawSubmit}
      />

      <WalletHistoryDrawer
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
      />
    </Page>
  );
};
