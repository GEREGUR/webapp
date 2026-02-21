import ChatIcon from '@/shared/assets/chat.svg?react';

export const ChatButton = () => {
  return (
    <button
      type="button"
      className="flex size-10 items-center justify-center rounded-[8px] bg-[#232027]"
    >
      <ChatIcon className="size-5 text-white" />
    </button>
  );
};
