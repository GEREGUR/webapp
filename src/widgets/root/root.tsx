import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Routes } from 'react-router-dom';
import { miniApp, useLaunchParams, useSignal } from '@tma.js/sdk-react';
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
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(platform as string) ? 'ios' : 'base'}
      >
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} Component={route.Component} />
          ))}
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </AppRoot>
    </QueryClientProvider>
  );
};
