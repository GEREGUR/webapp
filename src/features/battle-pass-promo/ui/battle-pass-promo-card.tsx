import { type FC } from 'react';

import { Button } from '@/shared/ui/button';

import PepeGiftIcon from '@/shared/assets/pepe-gift.png';
import RightOrnament from '@/shared/assets/right-ornament.svg';
import RightOrnamentTwo from '@/shared/assets/right-ornament-two.svg';
import LightOne from '@/shared/assets/light-1.svg';
import LightTwo from '@/shared/assets/light-2.svg';
import LightThree from '@/shared/assets/light-3.svg';
import LightFour from '@/shared/assets/light-4.svg';

export const BattlePassPromoCard: FC = () => {
  return (
    <div className="relative h-[80px] w-full overflow-hidden rounded-[10px] bg-[#5F81D8]">
      <img
        src={PepeGiftIcon}
        alt="Battle Pass mascot"
        className="absolute -bottom-[10px] left-[18px] z-1 h-[89px] w-[83px] max-w-none object-contain"
      />

      <img src={RightOrnament} className="absolute right-0 z-2" alt="Background ornament " />
      <img src={RightOrnamentTwo} className="absolute right-2 z-1" alt="Background ornament " />

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

      <div className="absolute top-1.5 right-[14px] z-10 flex max-w-[135px] flex-col items-center">
        <p className="font-bebas-cyrillic text-[26px] font-normal text-white uppercase">баттлпас</p>
        <Button
          className="font-bebas-cyrillic bg-button-bp-dark h-[26px] w-full rounded-[6px] px-0 py-0 text-[12.59px] leading-[13.85px] font-normal text-white"
          variant="primary"
        >
          ПОЛУЧИТЬ
        </Button>
      </div>
    </div>
  );
};
