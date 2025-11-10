import { api } from "./client";
import type { CallParticipant, CallSession } from "../types/api";

export interface StartCallPayload {
  channelId: string;
}

export interface CallSessionPayload {
  sessionId: string;
}

export async function startCall(payload: StartCallPayload) {
  const { data } = await api.post<{ session: CallSession }>("/calls/start", payload);
  return data.session;
}

export async function joinCall(payload: CallSessionPayload) {
  const { data } = await api.post<{ participant: CallParticipant }>("/calls/join", payload);
  return data.participant;
}

export async function leaveCall(payload: CallSessionPayload) {
  await api.post("/calls/leave", payload);
}

export async function endCall(payload: CallSessionPayload) {
  const { data } = await api.post<{ session: CallSession }>("/calls/end", payload);
  return data.session;
}
