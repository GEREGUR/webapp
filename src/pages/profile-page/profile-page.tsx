import { type FC, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/pages/page';
import { Avatar } from '@/shared/ui/avatar';
import { Loader } from '@/shared/ui/spinner';
import { useToast } from '@/shared/ui/toast';
import { useProfile } from '@/entities/user';
import { usePaymentData } from '@/entities/wallet';
import { useActivateBattlePass, useBattlePass } from '@/entities/battle-pass';
import { useTonConnect } from '@/shared/hooks/use-ton-connect';
import { useSetWallet } from '@/entities/user';
import { BattlePassPromoCard } from '@/features/battle-pass-promo';
import {
  WalletCard,
  DepositDrawer,
  WithdrawDrawer,
  WalletHistoryDrawer,
  DisconnectWalletDrawer,
} from '@/widgets/wallet-card';
import { ReferralCard } from '@/widgets/referral-card';

export const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const { data: battlePassData } = useBattlePass();
  const activateBattlePass = useActivateBattlePass();
  const { data: paymentData, refetch: refetchPaymentData } = usePaymentData({ enabled: false });
  const { isConnected, connect, disconnect, walletAddress } = useTonConnect();
  const setWalletMutation = useSetWallet();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isDepositOpen) {
      return;
    }

    void refetchPaymentData();
  }, [isDepositOpen, refetchPaymentData]);

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
  const isBpActive = Boolean(battlePassData);
  const hasProfileWallet = Boolean(profile?.wallet_address);

  const handleWalletButtonClick = () => {
    if (hasProfileWallet) {
      setIsDisconnectOpen(true);
      return;
    }

    void connect();
  };

  const handleDisconnectWallet = async () => {
    const disconnected = await disconnect();
    if (!disconnected) {
      return;
    }

    setIsDisconnectOpen(false);
    showToast('Кошелек отключен', 'success');
  };

  const handleBattlePassPromoClick = () => {
    if (isBpActive) {
      void navigate('/battle-pass');
      return;
    }

    activateBattlePass.mutate(undefined, {
      onSuccess: () => {
        showToast('Battle Pass активирован!', 'success');
        void navigate('/battle-pass');
      },
      onError: () => {
        showToast('Не удалось активировать Battle Pass', 'error');
      },
    });
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
      <div className="flex flex-col items-center gap-6 pb-20">
        <div className="flex flex-col items-center gap-3">
          <Avatar src={profile.avatar} alt={profile.name} size="xl" />
          <h1 className="text-xl text-[20px] font-[500] text-white">{profile.name}</h1>
          <p className="text-[15px] font-[500] text-white/60">ID: #{profile.id}</p>
        </div>

        <WalletCard
          tonBalance={profile.ton_balance}
          internalBalance={profile.internal_balance}
          onDeposit={() => setIsDepositOpen(true)}
          onWithdraw={() => setIsWithdrawOpen(true)}
          onHistory={() => setIsHistoryOpen(true)}
          onWalletClick={handleWalletButtonClick}
          isWalletConnected={hasProfileWallet}
          walletAddress={profile.wallet_address}
        />

        <BattlePassPromoCard isActive={isBpActive} onActivate={handleBattlePassPromoClick} />

        <ReferralCard referralEarn={profile.referral_earn} referralCount={0} userId={profile.id} />
      </div>

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
      <DisconnectWalletDrawer
        open={isDisconnectOpen}
        onClose={() => setIsDisconnectOpen(false)}
        onDisconnect={() => void handleDisconnectWallet()}
      />
    </Page>
  );
};
