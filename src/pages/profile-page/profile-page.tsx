import { type FC, useState, useRef } from 'react';
import { Page } from '@/pages/page';
import { Avatar } from '@/shared/ui/avatar';
import { Loader } from '@/shared/ui/spinner';
import { useToast } from '@/shared/ui/toast';
import { useProfile, usePaymentData } from '@/entities/user';
import { useTonConnect } from '@/shared/hooks/use-ton-connect';
import { useSetWallet } from '@/entities/user';
import { BattlePassPromoCard } from '@/features/battle-pass-promo';
import {
  WalletCard,
  DepositDrawer,
  WithdrawDrawer,
  WalletHistoryDrawer,
} from '@/widgets/wallet-card';
import { ReferralCard } from '@/widgets/referral-card';

export const ProfilePage: FC = () => {
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const { data: paymentData } = usePaymentData();
  const { isConnected, connect, walletAddress } = useTonConnect();
  const setWalletMutation = useSetWallet();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const syncedRef = useRef(false);

  if (
    !syncedRef.current &&
    isConnected &&
    walletAddress &&
    profile &&
    profile.wallet_address !== walletAddress
  ) {
    syncedRef.current = true;
    setWalletMutation.mutate({ address: walletAddress });
  }

  const walletAddressForDeposit = paymentData?.address ?? profile?.wallet_address ?? '';
  const depositMemo = paymentData?.memo ?? '';

  const handleConnectWallet = () => {
    if (isConnected && walletAddress) {
      showToast(
        `Кошелек подключен: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        'success'
      );
    } else {
      void connect();
    }
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
        <div className="relative z-10 !border-[#272525] !bg-[#131214] opacity-100">
          <p className="text-center text-white/60">Не удалось загрузить профиль</p>
        </div>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="mb-6 flex flex-col items-center">
        <Avatar src={profile.avatar} alt={profile.name} size="xl" className="mb-3" />
        <h1 className="text-xl font-normal text-white">{profile.name}</h1>
        <p className="text-[13px] text-white/60">ID: #{profile.username}</p>
      </div>

      <WalletCard
        tonBalance={profile.ton_balance}
        internalBalance={profile.internal_balance}
        onDeposit={() => setIsDepositOpen(true)}
        onWithdraw={() => setIsWithdrawOpen(true)}
        onHistory={() => setIsHistoryOpen(true)}
        onConnectWallet={handleConnectWallet}
        isWalletConnected={isConnected}
        walletAddress={walletAddress}
      />

      <div className="px-1.5 pt-6 pb-3">
        <BattlePassPromoCard />
      </div>

      <ReferralCard referralEarn={profile.referral_earn} referralCount={0} userId={profile.id} />

      <DepositDrawer
        open={isDepositOpen}
        walletAddress={walletAddressForDeposit}
        memo={depositMemo}
        onClose={() => setIsDepositOpen(false)}
      />

      <WithdrawDrawer
        open={isWithdrawOpen}
        maxTon={profile.ton_balance}
        onClose={() => setIsWithdrawOpen(false)}
      />

      <WalletHistoryDrawer open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </Page>
  );
};
