import { api } from "./client";
import type { Message, PaginatedMessages, Attachment } from "../types/api";

export interface SendMessagePayload {
  channelId: string;
  content?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface ListMessagesParams {
  limit?: number;
  cursor?: string;
}

export async function listMessages(channelId: string, params: ListMessagesParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.cursor) searchParams.set("cursor", params.cursor);
  const { data } = await api.get<PaginatedMessages>(`/messages/channel/${channelId}?${searchParams.toString()}`);
  return data;
}

export async function sendMessage(payload: SendMessagePayload) {
  const { data } = await api.post<{ message: Message }>("/messages", payload);
  return data.message;
}
