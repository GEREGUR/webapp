import { ReactNode } from 'react';

import { cn } from '../lib/utils';

export const MaxWidthWrapper = ({
  className,
  children,
  disableRightPadding = false,
}: {
  className?: string;
  children: ReactNode;
  disableRightPadding?: boolean;
}) => {
  return (
    <div
      className={cn(
        'mx-auto h-full w-full max-w-screen-xl px-4 md:px-12',
        disableRightPadding && 'pr-0 md:pr-0',
        className
      )}
    >
      {children}
    </div>
  );
};
