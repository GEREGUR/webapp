import { useNavigate } from 'react-router-dom';

import ChatIcon from '@/shared/assets/chat.svg?react';

export const ChatButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="flex h-10 w-[50px] items-center justify-center rounded-[8px] bg-[#232027]"
      onClick={() => {
        navigate(import.meta.env.VITE_CHAT_URL as string);
      }}
      disabled={!import.meta.env.VITE_CHAT_URL}
    >
      <ChatIcon className="size-5 text-white" />
    </button>
  );
};
