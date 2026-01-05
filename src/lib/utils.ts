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
  const mode = process.env.NEXT_PUBLIC_MODE?.toLowerCase();
  return mode === "prod" ? "prod" : "dev";
}

/**
 * Get the API URL based on the current mode
 * Matches the logic used in api.ts
 */
export function getApiUrl(): string {
  const mode = getMode();
  if (mode === "prod") {
    // In production mode, ONLY use NEXT_PUBLIC_API_URL_PROD
    const prodUrl = process.env.NEXT_PUBLIC_API_URL_PROD;
    if (!prodUrl) {
      const errorMsg =
        "[API Config] ERROR: NEXT_PUBLIC_MODE is set to 'prod' but NEXT_PUBLIC_API_URL_PROD is not defined. " +
        "Please set NEXT_PUBLIC_API_URL_PROD environment variable to your production API URL.";
      console.error(errorMsg);
      if (typeof window !== "undefined") {
        // In browser, show error but don't crash - use fallback
        console.error("Falling back to NEXT_PUBLIC_API_URL, but this may be incorrect:", process.env.NEXT_PUBLIC_API_URL);
        return process.env.NEXT_PUBLIC_API_URL || "";
      }
      // In SSR/build, throw error to prevent incorrect configuration
      throw new Error(errorMsg);
    }
    // Validate that prod URL is not localhost
    if (prodUrl.includes("localhost") || prodUrl.includes("127.0.0.1")) {
      console.warn(
        "[API Config] WARNING: NEXT_PUBLIC_API_URL_PROD appears to be a localhost URL:",
        prodUrl
      );
    }
    if (typeof window !== "undefined") {
      console.log("[API Config] Mode: prod, Using API URL:", prodUrl);
    }
    return prodUrl;
  }
  // Development mode - use dev URL or fallback to localhost
  const devUrl =
    process.env.NEXT_PUBLIC_API_URL_DEV ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api";
  if (typeof window !== "undefined") {
    console.log("[API Config] Mode: dev, Using API URL:", devUrl);
  }
  return devUrl;
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
