/**
 * Utility functions for the Indipal app
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names for conditional styling (use with NativeWind)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
