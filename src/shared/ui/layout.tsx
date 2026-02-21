import { type FC, type ReactNode } from 'react';
import { Header } from '@/widgets/header';

interface LayoutProps {
  children: ReactNode;
  tonBalance?: string;
  bpBalance?: string;
}

export const Layout: FC<LayoutProps> = ({ children, tonBalance, bpBalance }) => {
  return (
    <>
      <Header tonBalance={tonBalance} bpBalance={bpBalance} />
      <main className="pt-10">{children}</main>
    </>
  );
};
