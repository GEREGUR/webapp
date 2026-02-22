import { type FC } from 'react';
import { Button } from '@/shared/ui/button';
import PepeGiftIcon from '@/shared/assets/pepe-gift.png';

export const BattlePassPromoCard: FC = () => {
  return (
    <div className="relative h-[80px] w-full overflow-hidden rounded-[10px] bg-[linear-gradient(90deg,#6A8FE9_0%,#577BCF_45%,#4A66BB_100%)]">
      <div className="absolute top-1/2 left-[152px] h-[96px] w-[56px] -translate-y-1/2 -skew-x-[20deg] bg-[rgba(146,171,244,0.35)]" />
      <div className="absolute top-1/2 left-[188px] h-[74px] w-[36px] -translate-y-1/2 -skew-x-[20deg] bg-[rgba(123,149,226,0.35)]" />

      <img
        src={PepeGiftIcon}
        alt="Battle Pass mascot"
        className="absolute -bottom-[8px] left-[18px] h-[89px] w-[83px] max-w-none object-contain"
      />

      <div className="absolute top-1.5 right-[14px] flex flex-col items-center">
        <p className="text-[38.05px] leading-[41.86px] font-normal text-white uppercase">
          баттлпас
        </p>
        <Button
          className="bg-button-bp-dark h-[26px] w-full rounded-[6px] px-0 py-0 text-[14px] font-bold text-white"
          variant="primary"
        >
          ПОЛУЧИТЬ
        </Button>
      </div>
    </div>
  );
};
