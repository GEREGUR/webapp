import { type FC } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import TonIcon from '@/shared/assets/ton.svg?react';
import { Copy, UserPlus, Users } from 'lucide-react';

interface ReferralCardProps {
  referralEarn: number;
  referralCount: number;
  userId: number;
}

export const ReferralCard: FC<ReferralCardProps> = ({ referralEarn, referralCount, userId }) => {
  const handleInvite = () => {
    const referralUrl = `https://t.me/webapp?ref=${userId}`;
    const shareText = 'Присоединяйся к Battle Pass и зарабатывай!';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopy = () => {
    const url = `https://t.me/webapp?ref=${userId}`;
    void navigator.clipboard.writeText(`https://t.me/share/url?url=${encodeURIComponent(url)}`);
  };

  return (
    <Card className="relative z-10 mx-auto mt-3 flex h-[194px] w-full max-w-[370px] flex-col justify-between rounded-[10px] border border-[#272525] !bg-[#131214] p-4 opacity-100">
      <h2 className="max-w-[300px] text-[14px] leading-[1.25] font-normal text-balance text-white">
        Приглашайте друзей и зарабатывайте 10% от их сделок
      </h2>

      <div className="grid grid-cols-2 overflow-hidden rounded-[12px] bg-[#232027]">
        <div className="flex h-[60px] items-center justify-center gap-1 px-2">
          <span className="text-[12px] font-normal text-white">Приглашено:</span>
          <Users className="h-4 w-4 text-[#C37CE2]" />
          <span className="text-[12px] leading-none font-normal text-white">{referralCount}</span>
        </div>
        <div className="flex h-[60px] items-center justify-center gap-1 border-l border-white/20 px-2">
          <span className="text-[12px] font-normal text-white">Заработано:</span>
          <TonIcon className="h-4 w-4" />
          <span className="text-[12px] leading-none font-normal text-white">
            {referralEarn.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#2F3033] text-[13px] font-normal text-white hover:brightness-110"
          onClick={handleCopy}
        >
          <Copy className="mr-1 h-4 w-4 stroke-2" />
          Скопировать
        </Button>
        <Button
          type="button"
          className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#5F81D8] text-[13px] font-normal text-white hover:brightness-110"
          onClick={handleInvite}
        >
          <UserPlus className="mr-1 h-4 w-4 stroke-2" />
          Пригласить
        </Button>
      </div>
    </Card>
  );
};
