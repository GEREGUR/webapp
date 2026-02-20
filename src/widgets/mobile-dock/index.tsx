import { type FC, useState, type ReactNode, useEffect } from 'react';
import { LinkButton } from '@/features/link-button';

export interface DockButton {
  to: string;
  icon: ReactNode;
  label: string;
}

export interface MobileDockProps {
  buttons: DockButton[];
}

export const MobileDock: FC<MobileDockProps> = ({ buttons }) => {
  const [visible, setVisible] = useState(true);

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
        {buttons.map((button) => (
          <LinkButton
            key={button.to}
            to={button.to}
            className="flex flex-col items-center gap-1 p-2 text-white"
          >
            {button.icon}
            <span className="text-xs">{button.label}</span>
          </LinkButton>
        ))}
      </div>
    </div>
  );
};
