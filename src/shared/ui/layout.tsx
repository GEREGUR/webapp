import { type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header';

interface LayoutProps {
  children: ReactNode;
  tonBalance?: string;
  bpBalance?: string;
}

export const Layout: FC<LayoutProps> = ({ children, tonBalance, bpBalance }) => {
  const { pathname } = useLocation();
  const hideHeaderLeftSide = pathname === '/profile';

  return (
    <>
      <Header
        tonBalance={tonBalance}
        bpBalance={bpBalance}
        hideLeftSide={hideHeaderLeftSide}
      />
      <main className="pt-10">{children}</main>
    </>
  );
};
