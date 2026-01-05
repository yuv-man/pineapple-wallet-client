import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth";

// Get mode from environment (normalize to lowercase)
const MODE = process.env.NEXT_PUBLIC_MODE?.toLowerCase();

// Get API URL based on mode
const getApiUrl = () => {
  if (MODE === "prod") {
    // In production mode, ONLY use NEXT_PUBLIC_API_URL_PROD
    // Don't fallback to NEXT_PUBLIC_API_URL as it might be a dev URL
    const prodUrl = process.env.NEXT_PUBLIC_API_URL_PROD;
    if (!prodUrl) {
      const errorMsg =
        "[API Config] ERROR: NEXT_PUBLIC_MODE is set to 'prod' but NEXT_PUBLIC_API_URL_PROD is not defined. " +
        "Please set NEXT_PUBLIC_API_URL_PROD environment variable to your production API URL.";
      console.error(errorMsg);
      if (typeof window !== "undefined") {
        // In browser, show error but don't crash - use a placeholder that will fail gracefully
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
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: (refreshToken?: string) => api.post("/auth/logout", { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

// Users API
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (data: { name?: string; avatar?: string }) =>
    api.patch("/users/me", data),
  deleteMe: () => api.delete("/users/me"),
  searchUsers: (email: string) =>
    api.get("/users/search", { params: { email } }),
};

// Portfolios API
export const portfoliosApi = {
  getAll: () => api.get("/portfolios"),
  getOne: (id: string) => api.get(`/portfolios/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post("/portfolios", data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/portfolios/${id}`, data),
  delete: (id: string) => api.delete(`/portfolios/${id}`),
};

// Assets API
export const assetsApi = {
  getAllForPortfolio: (portfolioId: string) =>
    api.get(`/portfolios/${portfolioId}/assets`),
  getAssetsByType: (portfolioId: string) =>
    api.get(`/portfolios/${portfolioId}/assets/by-type`),
  getOne: (id: string) => api.get(`/assets/${id}`),
  create: (
    portfolioId: string,
    data: {
      type: string;
      name: string;
      value: number;
      currency?: string;
      notes?: string;
      details?: Record<string, any>;
    }
  ) => api.post(`/portfolios/${portfolioId}/assets`, data),
  update: (
    id: string,
    data: {
      name?: string;
      value?: number;
      currency?: string;
      notes?: string;
      details?: Record<string, any>;
    }
  ) => api.patch(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Sharing API
export const sharingApi = {
  sharePortfolio: (
    portfolioId: string,
    data: { email: string; permission?: string }
  ) => api.post(`/portfolios/${portfolioId}/share`, data),
  getShares: (portfolioId: string) =>
    api.get(`/portfolios/${portfolioId}/shares`),
  getInvitations: () => api.get("/invitations"),
  respondToInvitation: (id: string, accept: boolean) =>
    api.patch(`/invitations/${id}`, { accept }),
  updateShare: (id: string, permission: string) =>
    api.patch(`/shares/${id}`, { permission }),
  revokeShare: (id: string) => api.delete(`/shares/${id}`),
  getSharedWithMe: () => api.get("/shared-with-me"),
};

// Currency API
export const currencyApi = {
  getSupportedCurrencies: () => api.get("/currency/supported"),
  getExchangeRates: (baseCurrency: string = "USD") =>
    api.get("/currency/rates", { params: { base: baseCurrency } }),
  convert: (amount: number, from: string, to: string) =>
    api.get("/currency/convert", { params: { amount, from, to } }),
  getNetWorth: (currency: string = "USD") =>
    api.get("/currency/net-worth", { params: { currency } }),
  getPortfolioSummary: (portfolioId: string, currency: string = "USD") =>
    api.get("/currency/portfolio-summary", {
      params: { portfolioId, currency },
    }),
};
