import { type FC, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps {
  to: string;
  children: ReactNode;
}

export const Link: FC<LinkProps> = ({ to, children }) => {
  return <RouterLink to={to} style={{ textDecoration: 'none' }}>{children}</RouterLink>;
};
