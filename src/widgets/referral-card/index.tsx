import { type FC, useState, useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import TonIcon from '@/shared/assets/ton.svg?react';
import { Copy, UserPlus, Users, Check } from 'lucide-react';
import { shareURL } from '@tma.js/sdk-react';

interface ReferralCardProps {
  referralEarn: number;
  referralCount: number;
  userId: number;
}

const tmaUrl = import.meta.env.VITE_TG_BOT_URL as string;

export const ReferralCard: FC<ReferralCardProps> = ({ referralEarn, referralCount, userId }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCopy = useCallback(() => {
    setIsChecked(true);
    const url = `${tmaUrl}?ref=${userId}`;
    void navigator.clipboard.writeText(`${tmaUrl}/share/url?url=${encodeURIComponent(url)}`);

    setTimeout(() => {
      setIsChecked(false);
    }, 2000);
  }, [userId, tmaUrl]);

  const handleInvite = () => {
    const referralUrl = `${tmaUrl}?ref=${userId}`;
    const shareText = 'Присоединяйся к нам и зарабатывай!';
    shareURL(referralUrl, shareText);
  };

  return (
    <Card className="relative z-10 mx-auto flex h-[194px] w-full flex-col justify-between rounded-[10px] border border-[#272525] !bg-[#131214] p-4 opacity-100">
      <h2 className="max-w-[300px] text-[15px] leading-[1.25] font-[400] text-balance text-white">
        Приглашайте друзей и зарабатывайте 10% от их сделок
      </h2>

      <div className="grid grid-cols-2 overflow-hidden rounded-[12px] bg-[#232027]">
        <div className="flex h-[60px] items-center justify-center gap-1 px-2">
          <span className="text-[13px] font-normal text-white">Приглашено:</span>
          <Users className="size-[14px] text-[#C37CE2]" />
          <span className="text-[12px] leading-none font-normal text-white">{referralCount}</span>
        </div>
        <div className="flex h-[60px] items-center justify-center gap-1 border-l border-white/20 px-2">
          <span className="text-[13px] font-normal text-white">Заработано:</span>
          <TonIcon className="size-[13px]" />
          <span className="text-[12px] leading-none font-normal text-white">
            {referralEarn.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#2F3033] text-[15px] font-normal text-white hover:brightness-110"
          onClick={handleCopy}
        >
          {isChecked ? (
            <Check className="mr-1 h-4 w-4 stroke-2" />
          ) : (
            <Copy className="mr-1 h-4 w-4 stroke-2" />
          )}
          {isChecked ? 'Скопировано' : 'Скопировать'}
        </Button>
        <Button
          type="button"
          className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#5F81D8] text-[15px] font-normal text-white hover:brightness-110"
          onClick={handleInvite}
        >
          <UserPlus className="mr-1 h-4 w-4 stroke-2" />
          Пригласить
        </Button>
      </div>
    </Card>
  );
};
