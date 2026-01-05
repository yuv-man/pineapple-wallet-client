import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the current application mode ('dev' or 'prod')
 */
export function getMode(): "dev" | "prod" {
  const mode = process.env.NEXT_PUBLIC_MODE;
  return mode as "dev" | "prod";
}

/**
 * Get the public URL based on the current mode
 * Useful for OAuth callbacks, sharing links, etc.
 */
export function getPublicUrl(): string {
  const mode = getMode();
  if (mode === "prod") {
    return (
      process.env.NEXT_PUBLIC_PUBLIC_URL_PROD ||
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:3001"
    );
  }
  return process.env.NEXT_PUBLIC_PUBLIC_URL_DEV || "http://localhost:3001";
}

/**
 * Check if the application is in production mode
 */
export function isProduction(): boolean {
  return getMode() === "prod";
}

/**
 * Check if the application is in development mode
 */
export function isDevelopment(): boolean {
  return getMode() === "dev";
}
