import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useLaunchParams } from '@tma.js/sdk-react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { MobileDock } from '@/widgets/mobile-dock';
import { Layout } from '@/widgets/layout';
import { ToastProvider } from '@/shared/ui/toast';
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
  tonBalance?: string;
  bpBalance?: string;
}

export const Root: FC<RootProps> = ({ routes, tonBalance = '0', bpBalance = '0' }) => {
  const lp = useLaunchParams();
  const platform = lp.platform || 'unknown';

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen w-screen overflow-x-hidden pb-16">
          <AppRoot
            appearance={'dark'}
            platform={['macos', 'ios'].includes(platform as string) ? 'ios' : 'base'}
          >
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <NuqsAdapter>
                <Layout tonBalance={tonBalance} bpBalance={bpBalance}>
                  <Routes>
                    {routes.map((route) => (
                      <Route key={route.path} path={route.path} Component={route.Component} />
                    ))}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              </NuqsAdapter>
              <MobileDock
                buttons={[
                  { to: '/', icon: MarketIcon, label: 'Рынок' },
                  { to: '/inventory', icon: InventoryIcon, label: 'Инвентарь' },
                  { to: '/battle-pass', icon: BattlePassIcon, label: 'БП' },
                  { to: '/awards', icon: RewardsIcon, label: 'Награды' },
                  { to: '/profile', icon: ProfileIcon, label: 'Профиль' },
                ]}
              />
            </BrowserRouter>
          </AppRoot>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};
