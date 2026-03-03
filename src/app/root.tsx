import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useLaunchParams } from '@tma.js/sdk-react';
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
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface RootProps {
  routes: RouteObject[];
}

export const Root: FC<RootProps> = ({ routes }) => {
  const lp = useLaunchParams();
  const platform = lp.platform || 'unknown';
  const manifestPath = `${import.meta.env.BASE_URL}tonconnect-manifest.json`;
  const manifestUrl = new URL(manifestPath, window.location.origin).toString();

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <ToastProvider>
          <MarketProvider>
            <div className="flex min-h-[100dvh] justify-center bg-black">
              <div className="relative w-full max-w-lg">
                <AppRoot
                  appearance={'dark'}
                  platform={['macos', 'ios'].includes(platform as string) ? 'ios' : 'base'}
                >
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
                </AppRoot>
              </div>
            </div>
          </MarketProvider>
        </ToastProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
};
