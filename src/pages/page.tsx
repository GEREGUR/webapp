import { backButton } from '@tma.js/sdk-react';
import { useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageProps {
  children: ReactNode;
  back?: boolean;
}

export const Page: FC<PageProps> = ({ children, back = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!back) {
      return;
    }
    if (!backButton.show.isAvailable()) {
      return;
    }

    backButton.show();
    const offClick = backButton.onClick(() => {
      navigate(-1);
    });

    return () => {
      offClick();
      if (backButton.hide.isAvailable()) {
        backButton.hide();
      }
    };
  }, [back, navigate]);

  return <div className="min-h-screen p-4">{children}</div>;
};
