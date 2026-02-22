import { type FC, type ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  back?: boolean;
}

export const Page: FC<PageProps> = ({ children }) => {
  return <div className="min-h-screen bg-black p-4">{children}</div>;
};
