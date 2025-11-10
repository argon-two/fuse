import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiUser, AuthResponse } from "../types/api";
import {
  registerOnTokensRefreshed,
  registerOnUnauthorized,
  registerRefreshTokenProvider,
  setApiBaseUrl,
  setAuthToken,
} from "../api/client";

interface SessionState {
  serverUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  setServerUrl: (url: string) => void;
  setAuthSession: (payload: AuthResponse, options?: { serverUrl?: string }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: ApiUser) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, _get) => ({
      serverUrl: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      setServerUrl: (url: string) => {
        setApiBaseUrl(url);
        set({ serverUrl: url });
      },
      setAuthSession: (payload: AuthResponse, options?: { serverUrl?: string }) => {
        if (options?.serverUrl) {
          setApiBaseUrl(options.serverUrl);
          set({ serverUrl: options.serverUrl });
        }
        setAuthToken(payload.accessToken);
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
        });
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        setAuthToken(accessToken);
        set({ accessToken, refreshToken });
      },
      setUser: (user: ApiUser) => set({ user }),
      clearSession: () => {
        setAuthToken(null);
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },
    }),
    {
      name: "fuse-session",
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          return;
        }
        const stored = state ?? useSessionStore.getInitialState();
        if (stored.serverUrl) {
          setApiBaseUrl(stored.serverUrl);
        }
        if (stored.accessToken) {
          setAuthToken(stored.accessToken);
        }
      },
    },
  ),
);

registerRefreshTokenProvider(() => useSessionStore.getState().refreshToken);
registerOnTokensRefreshed((data) => {
  const store = useSessionStore.getState();
  store.setTokens(data.accessToken, data.refreshToken);
  store.setUser(data.user);
});
registerOnUnauthorized(() => {
  useSessionStore.getState().clearSession();
});

export const sessionActions = {
  setServerUrl: (url: string) => useSessionStore.getState().setServerUrl(url),
  setAuthSession: (payload: AuthResponse, options?: { serverUrl?: string }) =>
    useSessionStore.getState().setAuthSession(payload, options),
  clearSession: () => useSessionStore.getState().clearSession(),
};
