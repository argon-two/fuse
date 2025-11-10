import { api } from "./client";
import type { Channel, ServerDetail, ServerSummary } from "../types/api";

export interface CreateServerPayload {
  name: string;
  slug?: string;
  description?: string;
  host?: string;
  port?: number;
}

export interface JoinServerPayload {
  inviteCode?: string;
}

export async function getServers() {
  const { data } = await api.get<{ servers: ServerSummary[] }>("/servers");
  return data.servers;
}

export async function getServerDetail(slug: string) {
  const { data } = await api.get<{ server: ServerDetail }>(`/servers/${slug}`);
  return data.server;
}

export async function createServer(payload: CreateServerPayload) {
  const { data } = await api.post<{ server: ServerDetail }>("/servers", payload);
  return data.server;
}

export async function joinServer(slug: string, payload: JoinServerPayload = {}) {
  const { data } = await api.post<{ server: ServerDetail }>(`/servers/${slug}/join`, payload);
  return data.server;
}

export interface CreateChannelPayload {
  serverSlug: string;
  name: string;
  description?: string;
  type: "TEXT" | "VOICE";
  position?: number;
}

export interface UpdateChannelPayload {
  name?: string;
  description?: string;
  position?: number;
}

export async function createChannel(payload: CreateChannelPayload) {
  const { data } = await api.post<{ channel: Channel }>("/channels", payload);
  return data.channel;
}

export async function updateChannel(channelId: string, payload: UpdateChannelPayload) {
  const { data } = await api.patch<{ channel: Channel }>(`/channels/${channelId}`, payload);
  return data.channel;
}
