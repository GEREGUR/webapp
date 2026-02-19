import { type FC, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export const LinkButton: FC<LinkButtonProps> = ({ to, children, ...props }) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
