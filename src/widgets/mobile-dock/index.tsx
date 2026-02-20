import { type FC, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

export interface DockButton {
  to: string;
  icon: string;
  label: string;
}

export interface MobileDockProps {
  buttons: DockButton[];
}

export const MobileDock: FC<MobileDockProps> = ({ buttons }) => {
  const [visible, setVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleFocus = () => setVisible(false);
    const handleBlur = () => setVisible(true);

    document.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('focus', handleFocus);
      handleBlur();
    };
  }, []);

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-[9999] bg-black/80 px-4 py-2 backdrop-blur-lg transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around">
        {buttons.map((button) => {
          const isActive = location.pathname === button.to;
          return (
            <Link key={button.to} to={button.to} className="flex flex-col items-center gap-1 p-2">
              <img
                src={button.icon}
                alt={button.label}
                className={cn(
                  'h-6 w-6 transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-40'
                )}
              />
              <span
                className={cn(
                  'text-xs transition-opacity',
                  isActive ? 'text-white' : 'text-white/40'
                )}
              >
                {button.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
