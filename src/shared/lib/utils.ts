import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseNumberInput = (value: string): string => {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
};
