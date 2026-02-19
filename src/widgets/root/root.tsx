import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { miniApp, useLaunchParams, useSignal } from '@tma.js/sdk-react';
import { MobileDock } from '@/widgets/mobile-dock';
import type { RouteObject } from '@/app/routes';

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
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <AppRoot
          appearance={isDark ? 'dark' : 'light'}
          platform={['macos', 'ios'].includes(platform as string) ? 'ios' : 'base'}
        >
          <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} Component={route.Component} />
              ))}
              <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
            <MobileDock
              buttons={[
                { to: '/', icon: '🏠', label: 'Home' },
                { to: '/market', icon: '🛒', label: 'Market' },
                { to: '/battle-pass', icon: '🎖️', label: 'Battle Pass' },
                { to: '/inventory', icon: '🎒', label: 'Inventory' },
                { to: '/awards', icon: '🏆', label: 'Awards' },
              ]}
            />
          </HashRouter>
        </AppRoot>
      </div>
    </QueryClientProvider>
  );
};
