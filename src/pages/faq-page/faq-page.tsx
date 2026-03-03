import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Page } from '../page';
import { useProfile, useSetInstruction } from '@/entities/user';
import { useToast } from '@/shared/ui/toast';

export const FaqPage: FC = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const setInstruction = useSetInstruction();
  const { showToast } = useToast();
  const hasCheckedInstruction = Boolean(profile?.is_checked_instruction);
  const isSubmitting = setInstruction.isPending;

  const handleContinue = async () => {
    if (hasCheckedInstruction) {
      void navigate('/');
      return;
    }

    try {
      await setInstruction.mutateAsync();
      void navigate('/');
    } catch {
      showToast('Не удалось обновить инструкцию', 'error');
    }
  };

  return (
    <Page back={hasCheckedInstruction}>
      <section className="app-dots-background flex h-[100dvh] w-full flex-col items-start justify-between overflow-hidden bg-black px-6">
        <div className="relative z-10 w-full max-w-lg py-20">
          <h1 className="font-sf-pro-display text-left text-[32px] leading-[36px] font-[510] text-white">
            Как это работает?
          </h1>
          <p className="font-sf-pro-display mt-3 text-left text-[15px] leading-[18.4px] font-light text-white/70">
            Покупайте ордеры других пользователей и обменивайте внутреннюю валюту на TON!
          </p>

          <div className="mt-20 flex h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/5 backdrop-blur-sm">
            <span className="font-sf-pro-display text-sm leading-[18.4px] font-light text-white/60">
              Placeholder image
            </span>

            <img src={import.meta.env.VITE_FAQ_IMG_URL as string} className="object-contain" />
          </div>
        </div>

        <Button
          className="relative z-10 mb-24 h-[50px] w-[214px] self-center"
          variant="accent"
          disabled={isSubmitting}
          onClick={() => void handleContinue()}
        >
          Далее
        </Button>
      </section>
    </Page>
  );
};
