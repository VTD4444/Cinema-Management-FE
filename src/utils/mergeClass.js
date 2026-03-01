import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely
 * Combines clsx for conditional classes and tailwind-merge to avoid specificity conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
