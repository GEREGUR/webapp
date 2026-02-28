import { type FC } from 'react';
import TonIcon from '@/shared/assets/ton.svg?react';
import BpIcon from '@/shared/assets/bp-points-sm.svg?react';
import PlusIcon from '@/shared/assets/plus.svg?react';
import { ChatButton } from '@/features/chat-button';
import { FaqButton } from '@/features/faq-button';
import { viewport } from '@tma.js/sdk-react';

interface HeaderProps {
  tonBalance?: string;
  bpBalance?: string;
  hideLeftSide?: boolean;
}

export const Header: FC<HeaderProps> = ({
  tonBalance = '0',
  bpBalance = '0',
  hideLeftSide = false,
}) => {
  return (
    <header
      className={`fixed right-0 left-0 z-50 mt-4 flex h-10 items-center justify-center bg-transparent ${
        viewport.isMounted() && viewport.isFullscreen() ? 'top-20' : 'top-0'
      }`}
    >
      <div
        className={`flex w-full max-w-lg items-center justify-between px-4 ${
          hideLeftSide ? 'justify-end' : ''
        }`}
      >
        {!hideLeftSide && (
          <div className="flex items-center gap-2">
            <ChatButton />
            <FaqButton />
          </div>
        )}

        <div className="flex h-10 items-center gap-2 rounded-[12px] border border-[#272525] bg-[#131214] px-2">
          <a
            href="/profile"
            className="flex size-6 items-center justify-center rounded-full bg-white"
          >
            <PlusIcon className="size-[17px] text-[#232027]" />
          </a>
          <div className="flex h-8 items-center gap-1.5 rounded-[10px] bg-[#232027] px-3">
            <TonIcon className="size-2.5 text-white" />
            <span className="text-xs font-medium text-white">{tonBalance}</span>
          </div>
          <div className="flex h-8 items-center gap-1.5 rounded-[10px] bg-[#232027] px-3">
            <BpIcon className="size-3.5 text-white" />
            <span className="text-xs font-medium text-white">{bpBalance}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
