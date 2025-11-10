import { api } from "./client";
import type { ApiUser, AuthResponse } from "../types/api";

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function logoutUser(refreshToken: string) {
  await api.post("/auth/logout", { refreshToken });
}

export async function fetchCurrentUser() {
  const { data } = await api.get<{ user: ApiUser }>("/auth/me");
  return data.user;
}

export async function pingServer(baseUrl: string) {
  const normalized = baseUrl.replace(/\/$/, "");
  const response = await fetch(`${normalized}/health`);
  if (!response.ok) {
    throw new Error("Не удалось подключиться к серверу");
  }
  return response.json();
}
