import { useLayoutEffect, type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { closingBehavior, miniApp, swipeBehavior } from '@tma.js/sdk-react';
import { useProfile } from '@/entities/user';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const hideHeaderLeftSide = pathname === '/profile' || pathname === '/awards';
  const { data: profile } = useProfile();

  const tonBalance = profile?.ton_balance.toString() ?? '0';
  const bpBalance = profile?.internal_balance.toString() ?? '0';

  useLayoutEffect(() => {
    try {
      if (miniApp.setHeaderColor.supports('rgb')) {
        miniApp.setHeaderColor('#000000');
        miniApp.headerColor();
      }
    } catch {
      // SDK not ready
    }

    try {
      if (closingBehavior.isConfirmationEnabled()) {
        closingBehavior.enableConfirmation();
      }
    } catch {
      // SDK not ready
    }

    try {
      if (swipeBehavior.isSupported()) {
        swipeBehavior.disableVertical();
      }
    } catch {
      // SDK not ready
    }
  }, []);

  return (
    <>
      <Header tonBalance={tonBalance} bpBalance={bpBalance} hideLeftSide={hideHeaderLeftSide} />
      <main className="pt-16 pb-10 lg:w-full">{children}</main>
    </>
  );
};
