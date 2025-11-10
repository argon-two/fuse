export type ChannelType = "TEXT" | "VOICE";

export interface ApiUser {
  id: string;
  email?: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  author: ApiUser;
  attachments: Attachment[];
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  description?: string | null;
  type: ChannelType;
  position: number;
}

export interface ServerSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  host?: string | null;
  port?: number | null;
  iconUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  role: string;
}

export interface ServerDetail extends ServerSummary {
  channels: Channel[];
}

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

export interface UploadResponse {
  files: Attachment[];
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor?: string;
}

export interface CallSession {
  id: string;
  channelId: string;
  createdById: string;
  active: boolean;
  createdAt: string;
  endedAt?: string | null;
  participants?: CallParticipant[];
}

export interface CallParticipant {
  id: string;
  user: ApiUser;
  userId?: string;
  joinedAt: string;
  leftAt?: string | null;
}
