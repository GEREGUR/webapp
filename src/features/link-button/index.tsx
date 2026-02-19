import { type FC, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, Pick<RouterLinkProps, 'to'> {
  children: ReactNode;
}

export const LinkButton: FC<LinkButtonProps> = ({ to, children, ...props }) => {
  return (
    <RouterLink to={to} {...props}>
      {children}
    </RouterLink>
  );
};
