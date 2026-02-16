import { Placeholder } from '@telegram-apps/telegram-ui';
import { type FC } from 'react';

export const EnvUnsupported: FC = () => {
  return (
    <Placeholder
      header="Oops"
      description="You are using too old Telegram client to run this application"
    >
      <img
        alt="Telegram sticker"
        src="https://xelene.me/telegram.gif"
        style={{ display: 'block', width: '144px', height: '144px' }}
      />
    </Placeholder>
  );
};
