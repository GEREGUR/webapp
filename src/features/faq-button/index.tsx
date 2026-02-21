import FaqIcon from '@/shared/assets/faq.svg?react';

export const FaqButton = () => {
  return (
    <button
      type="button"
      className="flex size-10 items-center justify-center rounded-[8px] bg-[#232027]"
    >
      <FaqIcon className="size-5 text-white" />
    </button>
  );
};
