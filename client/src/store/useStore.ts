import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  status: string;
}

export interface Channel {
  id: number;
  name: string;
  type: string;
  created_by: number;
  created_at: string;
}

export interface Message {
  id: number;
  channel_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  content?: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

interface VoiceState {
  channelId: number | null;
  participants: number[];
  isMuted: boolean;
  isDeafened: boolean;
  isVideoEnabled: boolean;
}

interface AppState {
  // Connection
  isConnected: boolean;
  serverHost: string | null;
  serverPort: number | null;
  
  // Auth
  user: User | null;
  token: string | null;
  
  // Channels & Messages
  channels: Channel[];
  currentChannelId: number | null;
  messages: Record<number, Message[]>;
  
  // Users
  onlineUsers: User[];
  
  // Voice/Video
  voiceState: VoiceState;
  
  // UI
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConnection: (host: string, port: number) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channelId: number | null) => void;
  addMessage: (channelId: number, message: Message) => void;
  setMessages: (channelId: number, messages: Message[]) => void;
  setOnlineUsers: (users: User[]) => void;
  setVoiceChannel: (channelId: number | null) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleVideo: () => void;
  addVoiceParticipant: (userId: number) => void;
  removeVoiceParticipant: (userId: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  isConnected: false,
  serverHost: null,
  serverPort: null,
  user: null,
  token: null,
  channels: [],
  currentChannelId: null,
  messages: {},
  onlineUsers: [],
  voiceState: {
    channelId: null,
    participants: [],
    isMuted: false,
    isDeafened: false,
    isVideoEnabled: false
  },
  isLoading: false,
  error: null,

  // Actions
  setConnection: (host, port) => set({ serverHost: host, serverPort: port, isConnected: true }),
  
  setAuth: (user, token) => set({ user, token }),
  
  logout: () => set({
    user: null,
    token: null,
    channels: [],
    currentChannelId: null,
    messages: {},
    onlineUsers: [],
    voiceState: {
      channelId: null,
      participants: [],
      isMuted: false,
      isDeafened: false,
      isVideoEnabled: false
    }
  }),
  
  setChannels: (channels) => set({ channels }),
  
  setCurrentChannel: (channelId) => set({ currentChannelId: channelId }),
  
  addMessage: (channelId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: [...(state.messages[channelId] || []), message]
    }
  })),
  
  setMessages: (channelId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [channelId]: messages
    }
  })),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setVoiceChannel: (channelId) => set((state) => ({
    voiceState: { ...state.voiceState, channelId }
  })),
  
  toggleMute: () => set((state) => ({
    voiceState: { ...state.voiceState, isMuted: !state.voiceState.isMuted }
  })),
  
  toggleDeafen: () => set((state) => ({
    voiceState: { ...state.voiceState, isDeafened: !state.voiceState.isDeafened }
  })),
  
  toggleVideo: () => set((state) => ({
    voiceState: { ...state.voiceState, isVideoEnabled: !state.voiceState.isVideoEnabled }
  })),
  
  addVoiceParticipant: (userId) => set((state) => ({
    voiceState: {
      ...state.voiceState,
      participants: [...state.voiceState.participants, userId]
    }
  })),
  
  removeVoiceParticipant: (userId) => set((state) => ({
    voiceState: {
      ...state.voiceState,
      participants: state.voiceState.participants.filter(id => id !== userId)
    }
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
}));
