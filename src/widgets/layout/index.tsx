import { useLayoutEffect, type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { closingBehavior, miniApp, swipeBehavior } from '@tma.js/sdk-react';

interface LayoutProps {
  children: ReactNode;
  tonBalance?: string;
  bpBalance?: string;
}

export const Layout: FC<LayoutProps> = ({ children, tonBalance, bpBalance }) => {
  const { pathname } = useLocation();
  const hideHeaderLeftSide = pathname === '/profile' || pathname === '/awards';

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
