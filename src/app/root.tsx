import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { MobileDock } from '@/widgets/mobile-dock';
import { Layout } from '@/widgets/layout';
import { ToastProvider } from '@/shared/ui/toast';
import { MarketProvider } from '@/entities/market';
import type { RouteObject } from '@/app/routes';
import MarketIcon from '@/shared/assets/market.svg?react';
import BattlePassIcon from '@/shared/assets/bp.svg?react';
import InventoryIcon from '@/shared/assets/invenotry.svg?react';
import RewardsIcon from '@/shared/assets/rewards.svg?react';
import ProfileIcon from '@/shared/assets/profile.svg?react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (!axios.isAxiosError(error)) return false;

        const status = error.response?.status;

        if (status === 429) {
          return failureCount < 3;
        }

        if (status && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < 2;
      },

      retryDelay: (attempt, error) => {
        if (axios.isAxiosError(error) && error?.response?.status === 429) {
          console.log('[RATE LIMIT]: reached', 2 ** attempt * 2000, error);
          return 4000 * 2 ** attempt;
        }

        return 0;
      },

      refetchOnWindowFocus: false,
    },
  },
});

interface RootProps {
  routes: RouteObject[];
}

export const Root = ({ routes }: RootProps) => {
  const manifestPath = `${import.meta.env.BASE_URL}tonconnect-manifest.json`;
  const manifestUrl = new URL(manifestPath, window.location.origin).toString();

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <ToastProvider>
          <MarketProvider>
            <div className="flex min-h-[100dvh] justify-center bg-black">
              <div className="relative w-full max-w-lg">
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <NuqsAdapter>
                    <Layout>
                      <Routes>
                        {routes.map((route) => (
                          <Route key={route.path} path={route.path} Component={route.Component} />
                        ))}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </Layout>
                    <MobileDock
                      buttons={[
                        { to: '/', icon: MarketIcon, label: 'Рынок' },
                        {
                          to: '/inventory',
                          icon: InventoryIcon,
                          label: 'Инвентарь',
                          disabled: true,
                        },
                        { to: '/battle-pass', icon: BattlePassIcon, label: 'БП' },
                        { to: '/awards', icon: RewardsIcon, label: 'Награды' },
                        { to: '/profile', icon: ProfileIcon, label: 'Профиль' },
                      ]}
                    />
                  </NuqsAdapter>
                </BrowserRouter>
              </div>
            </div>
          </MarketProvider>
        </ToastProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
};
