import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/ui/card';
import { backButton } from '@tma.js/sdk-react';
import { Loader } from '@/shared/ui/spinner';
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

export const PageLoader = () => {
  return (
    <div className="absolute top-0 z-[200] grid h-[calc(100dvh-76px)] w-full place-items-center py-8">
      <Card className="grid size-15 place-items-center">
        <Loader />
      </Card>
    </div>
  );
};
