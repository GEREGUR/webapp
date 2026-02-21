import { type FC } from 'react';
import ChatIcon from '@/shared/assets/chat.svg?react';
import FaqIcon from '@/shared/assets/faq.svg?react';
import TonIcon from '@/shared/assets/ton.svg?react';
import BpIcon from '@/shared/assets/bp.svg?react';
import PlusIcon from '@/shared/assets/plus.svg?react';

interface HeaderProps {
  tonBalance?: string;
  bpBalance?: string;
}

export const Header: FC<HeaderProps> = ({ tonBalance = '0', bpBalance = '0' }) => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-10 items-center justify-between bg-transparent px-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-[8px] bg-[#232027]"
        >
          <ChatIcon className="size-5 text-white" />
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-[8px] bg-[#232027]"
        >
          <FaqIcon className="size-5 text-white" />
        </button>
      </div>

      <div className="flex h-10 items-center gap-2 rounded-[12px] border border-[#272525] bg-[#131214] px-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full bg-white"
        >
          <PlusIcon className="size-4 text-[#232027]" />
        </button>
        <div className="flex h-8 items-center gap-1.5 rounded-full bg-[#232027] px-3">
          <TonIcon className="size-3.5 text-white" />
          <span className="text-xs font-medium text-white">{tonBalance}</span>
        </div>
        <div className="flex h-8 items-center gap-1.5 rounded-full bg-[#232027] px-3">
          <BpIcon className="size-3.5 text-white" />
          <span className="text-xs font-medium text-white">{bpBalance}</span>
        </div>
      </div>
    </header>
  );
};
