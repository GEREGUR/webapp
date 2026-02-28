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
    if (!backButton.show.isAvailable()) {
      return;
    }

    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }

    if (backButton.hide.isAvailable()) {
      backButton.hide();
    }
  }, [back, navigate]);

  useEffect(() => {
    return () => {
      if (backButton.hide.isAvailable()) {
        backButton.hide();
      }
    };
  }, []);

  return <div className="min-h-[calc(100dvh-76px)] p-4">{children}</div>;
};
