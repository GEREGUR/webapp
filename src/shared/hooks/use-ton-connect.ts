import { useEffect, useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useSetWallet, useClearWallet } from '@/entities/user';
import { useToast } from '@/shared/ui/toast';

interface TonConnectHookReturn {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<boolean>;
  sendTransaction: (transaction: {
    to: string;
    amount: string;
    payload?: string;
  }) => Promise<string | null>;
}

export const useTonConnect = (): TonConnectHookReturn => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const rawAddress = useTonAddress(false);
  const userFriendlyAddress = useTonAddress();
  const { showToast } = useToast();

  const setWalletMutation = useSetWallet();
  const clearWalletMutation = useClearWallet();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!wallet?.account.address;

  useEffect(() => {
    if (!wallet) {
      return;
    }

    if (wallet.account.chain !== '-239') {
      showToast('Выберите mainnet в кошельке и подключитесь снова', 'error');
      void tonConnectUI?.disconnect();
    }
  }, [showToast, tonConnectUI, wallet]);

  useEffect(() => {
    if (!wallet || !rawAddress) {
      return;
    }

    const syncWallet = async () => {
      if (wallet.account.address === rawAddress) {
        return;
      }

      setIsSyncing(true);
      try {
        await setWalletMutation.mutateAsync({ address: wallet.account.address });
      } catch (error) {
        console.error('Failed to sync wallet:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    void syncWallet();
  }, [wallet, rawAddress, setWalletMutation]);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await tonConnectUI?.openModal();
    } catch {
      showToast('Не удалось открыть подключение кошелька', 'error');
    } finally {
      setIsConnecting(false);
    }
  }, [showToast, tonConnectUI]);

  const disconnect = useCallback(async (): Promise<boolean> => {
    try {
      await tonConnectUI?.disconnect();
      await clearWalletMutation.mutateAsync();
      return true;
    } catch {
      showToast('Не удалось отключить кошелёк', 'error');
      return false;
    }
  }, [showToast, tonConnectUI, clearWalletMutation]);

  const sendTransaction = useCallback(
    async (transaction: {
      to: string;
      amount: string;
      payload?: string;
    }): Promise<string | null> => {
      if (!wallet) {
        showToast('Сначала подключите кошелёк', 'error');
        return null;
      }

      if (wallet.account.chain !== '-239') {
        showToast('Поддерживается только mainnet-кошелёк', 'error');
        return null;
      }

      try {
        const result = await tonConnectUI?.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: transaction.to,
              amount: transaction.amount,
              payload: transaction.payload,
            },
          ],
        });

        if (result) {
          return result.boc;
        }
        return null;
      } catch {
        showToast('Не удалось отправить транзакцию', 'error');
        return null;
      }
    },
    [showToast, wallet, tonConnectUI]
  );

  return {
    walletAddress: userFriendlyAddress || null,
    isConnected,
    isConnecting,
    isSyncing,
    connect,
    disconnect,
    sendTransaction,
  };
};
