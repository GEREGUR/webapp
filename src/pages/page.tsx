import { cn } from '@/shared/lib/utils';
import { backButton } from '@tma.js/sdk-react';
import { useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageProps {
  children: ReactNode;
  back?: boolean;
  className?: string;
}

export const Page: FC<PageProps> = ({ children, back = false, className }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!backButton.show.isAvailable()) {
      return;
    }

    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }

    return () => {
      if (backButton.hide.isAvailable()) {
        backButton.hide();
      }
    };
  }, [back, navigate]);

  return <div className={cn('min-h-[calc(100dvh-76px)] p-4', className)}>{children}</div>;
};
