import { type FC, type ReactNode } from 'react';
import { Header } from '@/shared/ui/header';

interface LayoutProps {
  children: ReactNode;
  tonBalance?: string;
  bpBalance?: string;
}

export const Layout: FC<LayoutProps> = ({ children, tonBalance, bpBalance }) => {
  return (
    <>
      <Header tonBalance={tonBalance} bpBalance={bpBalance} />
      <main className="pt-14">{children}</main>
    </>
  );
};
