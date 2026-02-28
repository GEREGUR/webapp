import { Link } from 'react-router-dom';
import FaqIcon from '@/shared/assets/faq.svg?react';

export const FaqButton = () => {
  return (
    <Link
      to="/faq"
      className="flex h-10 w-[50px] items-center justify-center rounded-[8px] bg-[#232027]"
      aria-label="FAQ"
    >
      <FaqIcon className="size-5 text-white" />
    </Link>
  );
};
