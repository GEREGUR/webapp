import { type FC } from 'react';
import { Page } from '@/pages/page';
import { Card } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Loader } from '@/shared/ui/spinner';
import { useProfile } from '@/entities/user';

export const ProfilePage: FC = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Page back>
        <Loader />
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page back>
        <Card>
          <p className="text-center text-white/60">Не удалось загрузить профиль</p>
        </Card>
      </Page>
    );
  }

  return (
    <Page back>
      <div className="mb-6 flex flex-col items-center">
        <Avatar
          src={profile.avatar}
          alt={profile.name}
          fallback={profile.name}
          size="lg"
          className="mb-3"
        />
        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <p className="text-white/60">@{profile.username}</p>
      </div>

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-white">Баланс</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Внутренний (BP)</span>
            <span className="font-medium text-white">
              {profile.internal_balance.toLocaleString()} BP
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">TON</span>
            <span className="font-medium text-white">
              {profile.ton_balance.toLocaleString()} TON
            </span>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-white">Кошелёк</h2>
        {profile.wallet_address ? (
          <div className="flex items-center justify-between">
            <span className="max-w-[200px] truncate text-sm text-white/60">
              {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
            </span>
            <Button size="sm" variant="ghost">
              Изменить
            </Button>
          </div>
        ) : (
          <Button className="w-full">Подключить кошелёк</Button>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Реферальные заработки</span>
          <span className="text-primary font-medium">
            {profile.referral_earn.toLocaleString()} BP
          </span>
        </div>
      </Card>
    </Page>
  );
};
