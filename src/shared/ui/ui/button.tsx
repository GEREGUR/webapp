import { Button as TelegramButton } from '@telegram-apps/telegram-ui';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const Button = ({ children, ...props }: ButtonProps) => {
  return <TelegramButton {...props}>{children}</TelegramButton>;
};
