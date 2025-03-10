import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to display in a friendly format
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Generate a QR code URL using QR code generator API
export function generateQRCodeURL(text: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}`;
}

// Format price with currency symbol
export function formatPrice(price: number, currency: string = "coins"): string {
  return `${price} ${currency}`;
}

// Generate a random ID (for development purposes)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Check if the current device is mobile
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
