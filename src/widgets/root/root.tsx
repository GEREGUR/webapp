import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { miniApp, useLaunchParams, useSignal } from '@tma.js/sdk-react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { MobileDock } from '@/widgets/mobile-dock';
import { ToastProvider } from '@/shared/ui/toast';
import type { RouteObject } from '@/app/routes';
import HomeIcon from '@/shared/assets/chat.svg?url';
import MarketIcon from '@/shared/assets/market.svg?url';
import BattlePassIcon from '@/shared/assets/bp.svg?url';
import InventoryIcon from '@/shared/assets/invenotry.svg?url';
import RewardsIcon from '@/shared/assets/rewards.svg?url';
import ProfileIcon from '@/shared/assets/profile.svg?url';

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
  const isDark = useSignal(miniApp.isDark);
  const platform = lp.platform || 'unknown';

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <AppRoot
            appearance={isDark ? 'dark' : 'light'}
            platform={['macos', 'ios'].includes(platform as string) ? 'ios' : 'base'}
          >
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <NuqsAdapter>
                <Routes>
                  {routes.map((route) => (
                    <Route key={route.path} path={route.path} Component={route.Component} />
                  ))}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </NuqsAdapter>
              <MobileDock
                buttons={[
                  { to: '/', icon: HomeIcon, label: 'Главная' },
                  { to: '/market', icon: MarketIcon, label: 'Магазин' },
                  { to: '/battle-pass', icon: BattlePassIcon, label: 'БП' },
                  { to: '/inventory', icon: InventoryIcon, label: 'Инвентарь' },
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
