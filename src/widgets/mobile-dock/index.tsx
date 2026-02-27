import { type FC, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

interface DockButton {
  to: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  disabled?: boolean;
}

interface MobileDockProps {
  buttons: DockButton[];
}

export const MobileDock: FC<MobileDockProps> = ({ buttons }) => {
  const [visible, setVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      className={`fixed right-0 bottom-0 left-0 z-[9999] flex justify-center border-t border-white/20 bg-black/80 backdrop-blur-lg transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex w-full max-w-lg items-center justify-around px-4 py-2">
        {buttons.map((button) => {
          const isActive = location.pathname === button.to;
          const isDisabled = button.disabled;
          return isDisabled ? (
            <div
              key={button.to}
              className={cn('flex flex-col items-center gap-1 p-2', 'text-white/20')}
            >
              <button.icon className="h-6 w-6" style={{ color: 'currentColor' }} />
              <span className="text-xs">{button.label}</span>
            </div>
          ) : (
            <Link
              key={button.to}
              to={button.to}
              className={cn(
                'flex flex-col items-center gap-1 p-2',
                isActive ? 'text-white' : 'text-white/40'
              )}
            >
              <button.icon className="h-6 w-6" style={{ color: 'currentColor' }} />
              <span className="text-xs">{button.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
