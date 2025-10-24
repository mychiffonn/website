import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ========================================
// UI Utilities
// ========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
