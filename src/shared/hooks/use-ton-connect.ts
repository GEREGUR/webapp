import { useEffect, useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useSetWallet, useClearWallet } from '@/entities/user';

interface TonConnectHookReturn {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
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

  const setWalletMutation = useSetWallet();
  const clearWalletMutation = useClearWallet();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!wallet?.account.address;

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
    } catch (error) {
      console.error('Failed to open connect modal:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI?.disconnect();
      await clearWalletMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [tonConnectUI, clearWalletMutation]);

  const sendTransaction = useCallback(
    async (transaction: {
      to: string;
      amount: string;
      payload?: string;
    }): Promise<string | null> => {
      if (!wallet) {
        console.error('Wallet not connected');
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
      } catch (error) {
        console.error('Transaction failed:', error);
        return null;
      }
    },
    [wallet, tonConnectUI]
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
