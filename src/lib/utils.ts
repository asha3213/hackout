import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBatchHash(data: any): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCID(): string {
  return `Qm${Math.random().toString(36).substr(2, 44)}`;
}

export function formatAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return ''; // Returns an empty string if the address is not valid, preventing a crash.
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}