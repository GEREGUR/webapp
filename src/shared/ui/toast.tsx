'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { viewport } from '@tma.js/sdk-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

let toastId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="size-[18px] shrink-0" style={{ color: '#a6ff8b' }} />,
  error: <XCircle className="size-[18px] shrink-0" style={{ color: '#ff6b6b' }} />,
  info: <Info className="size-[18px] shrink-0" style={{ color: '#237bff' }} />,
};

const accentBorder: Record<ToastType, string> = {
  success: 'border-l-[#a6ff8b]',
  error: 'border-l-[#ff6b6b]',
  info: 'border-l-[#237bff]',
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed ${viewport.isFullscreen() ? 'top-40' : 'top-6'} right-6 z-[10001] flex w-fit max-w-[calc(100dvw-48px)] flex-col-reverse gap-3`}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 35,
                mass: 1,
              }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-lg border border-l-[3px] px-4 py-3',
                'shadow-[0_4px_24px_rgba(0,0,0,0.45)]',
                accentBorder[toast.type]
              )}
              style={{
                backgroundColor: '#131214',
                borderColor: '#272525',
                borderLeftColor: undefined,
              }}
            >
              <div>{icons[toast.type]}</div>

              <p
                className="flex-1 text-center text-[13px] leading-[1.45] font-medium"
                style={{ color: '#ffffff' }}
              >
                {toast.message}
              </p>

              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded p-0.5 transition-colors hover:bg-white/10"
                aria-label="Dismiss toast"
              >
                <X className="size-3.5" style={{ color: '#ffffff', opacity: 0.4 }} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
