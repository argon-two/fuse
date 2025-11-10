import { create } from "zustand";

interface WorkspaceState {
  activeServerSlug: string | null;
  activeChannelId: string | null;
  setActiveServerSlug: (slug: string | null) => void;
  setActiveChannelId: (channelId: string | null) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeServerSlug: null,
  activeChannelId: null,
  setActiveServerSlug: (slug) => set({ activeServerSlug: slug, activeChannelId: null }),
  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  reset: () => set({ activeServerSlug: null, activeChannelId: null }),
}));
