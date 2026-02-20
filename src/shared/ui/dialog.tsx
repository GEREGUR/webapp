import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export const Dialog = ({ children, open, onClose }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md">{children}</div>
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-[#1a1a1a] p-4', className)}>
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  children: ReactNode;
}

export const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className="mb-4">{children}</div>;
};

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>;
};

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return <p className={cn('text-sm text-white/60', className)}>{children}</p>;
};

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return <div className={cn('mt-4 flex gap-2', className)}>{children}</div>;
};
