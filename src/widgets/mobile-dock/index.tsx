import { type FC, useState, type ReactNode } from 'react';
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

  const handleFocus = () => setVisible(false);
  const handleBlur = () => setVisible(true);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg px-4 py-2 transition-transform duration-300 z-[9999] ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={() => setVisible(true)}
    >
      <div className="flex justify-around items-center">
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
