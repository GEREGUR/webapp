import FaqIcon from '@/shared/assets/faq.svg?react';

export const FaqButton = () => {
  return (
    <button
      type="button"
      className="flex h-10 w-[50px] items-center justify-center rounded-[8px] bg-[#232027]"
    >
      <FaqIcon className="size-5 text-white" />
    </button>
  );
};
