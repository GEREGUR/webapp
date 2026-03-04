import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseNumberInput = (value: string): string => {
  return value
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');
};

export const formatFloat = (value: number | string, decimals: number): string => {
  const num = typeof value === 'number' ? value : Number(value);

  if (isNaN(num)) return '';

  const fixed = num.toFixed(decimals);

  return fixed.replace(/\.?0+$/, '');
};
