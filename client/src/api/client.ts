import axios from "axios";
import type { AuthResponse } from "../types/api";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

let currentServerUrl: string | null = null;
let accessToken: string | null = null;
let refreshTokenProvider: () => string | null = () => null;
let onTokensRefreshed: (data: AuthResponse) => void = () => {};
let onUnauthorized: () => void = () => {};

export function setApiBaseUrl(serverUrl: string | null) {
  currentServerUrl = serverUrl;
  api.defaults.baseURL = serverUrl ? `${serverUrl.replace(/\/$/, "")}/api` : "";
}

export function getCurrentServerUrl() {
  return currentServerUrl;
}

export function setAuthToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function registerRefreshTokenProvider(fn: () => string | null) {
  refreshTokenProvider = fn;
}

export function registerOnTokensRefreshed(fn: (data: AuthResponse) => void) {
  onTokensRefreshed = fn;
}

export function registerOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

let isRefreshing = false;
let refreshPromise: Promise<AuthResponse | null> | null = null;

async function refreshTokens() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = refreshTokenProvider();
  if (!refreshToken) {
    return null;
  }

  isRefreshing = true;
  refreshPromise = api
    .post<AuthResponse>("/auth/refresh", { refreshToken })
    .then((response) => {
      onTokensRefreshed(response.data);
      return response.data;
    })
    .catch((error) => {
      onUnauthorized();
      throw error;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          return Promise.reject(error);
        }
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export function getAccessToken() {
  return accessToken;
}
