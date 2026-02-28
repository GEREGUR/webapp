import { type FC } from 'react';

import { Button } from '@/shared/ui/button';

import PepeGiftIcon from '@/shared/assets/pepe-gift.png';
import RightOrnament from '@/shared/assets/right-ornament.svg';
import RightOrnamentTwo from '@/shared/assets/right-ornament-two.svg';
import LightOne from '@/shared/assets/light-1.svg';
import LightTwo from '@/shared/assets/light-2.svg';
import LightThree from '@/shared/assets/light-3.svg';
import LightFour from '@/shared/assets/light-4.svg';

interface BattlePassPromoCardProps {
  isActive?: boolean;
  onActivate?: () => void;
  onOpenOverlay?: () => void;
}

export const BattlePassPromoCard: FC<BattlePassPromoCardProps> = ({
  isActive = false,
  onActivate,
  onOpenOverlay,
}) => {
  const handleButtonClick = () => {
    if (isActive && onOpenOverlay) {
      onOpenOverlay?.();
      return;
    }

    onActivate?.();
  };

  return (
    <div className="relative h-[80px] w-full overflow-hidden rounded-[10px] bg-[#5F81D8]">
      <img
        src={PepeGiftIcon}
        alt="Battle Pass mascot"
        className="absolute -bottom-[10px] left-[18px] z-1 h-[89px] w-[83px] max-w-none object-contain"
      />

      <img
        src={RightOrnament}
        className="absolute -right-5 bottom-0 z-2 scale-120 rotate-5"
        alt="Background ornament "
      />
      <img
        src={RightOrnamentTwo}
        className="absolute -right-7 bottom-0 z-1 scale-130 rotate-6"
        alt="Background ornament "
      />

      <img src={LightOne} className="absolute top-0 left-10 z-0" alt="Background ornament " />
      <img
        src={LightTwo}
        className="absolute -top-4 -left-38 z-0 scale-140 rotate-195"
        alt="Background ornament "
      />
      <img
        src={LightThree}
        className="absolute -bottom-3 left-14 z-0 scale-180 rotate-218"
        alt="Background ornament "
      />
      <img
        src={LightFour}
        className="absolute -bottom-1 -left-4 z-0 -rotate-40"
        alt="Background ornament "
      />

      <div className="absolute top-2.5 right-[14px] z-10 flex max-w-[125px] flex-col items-center">
        <p className="font-bebas-cyrillic ml-3 text-[38px] leading-8.5 font-semibold text-white uppercase">
          батлпасc
        </p>
        {isActive ? (
          <Button
            className="font-bebas-cyrillic bg-button-bp-dark ml-3 h-[26px] w-full rounded-[6px] px-0 py-0 text-center text-[12.59px] leading-[13.85px] font-normal -tracking-tight text-white"
            variant="primary"
            onClick={handleButtonClick}
          >
            ПОЛУЧИТЬ
          </Button>
        ) : (
          <Button
            className="font-bebas-cyrillic ml-3 h-[26px] w-full rounded-[6px] bg-green-500 px-0 py-0 text-center text-[12.59px] leading-[13.85px] font-normal -tracking-tight text-white hover:bg-green-600"
            variant="primary"
            onClick={handleButtonClick}
          >
            АКТИВИРОВАТЬ
          </Button>
        )}
      </div>
    </div>
  );
};
