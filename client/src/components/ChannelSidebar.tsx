import type { JSX } from "react";
import type { Channel } from "../types/api";
import { Hash, Mic } from "lucide-react";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId?: string | null;
  onSelectChannel: (channel: Channel) => void;
  onCreateChannel?: (type: Channel["type"]) => void;
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
}: ChannelSidebarProps) {
  const textChannels = channels.filter((channel) => channel.type === "TEXT");
  const voiceChannels = channels.filter((channel) => channel.type === "VOICE");

  const renderChannel = (channel: Channel, icon: JSX.Element) => {
    const active = channel.id === activeChannelId;
    return (
      <button
        key={channel.id}
        onClick={() => onSelectChannel(channel)}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
          active
            ? "bg-accent/10 text-foreground"
            : "text-muted hover:bg-surfaceElevated hover:text-foreground"
        }`}
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-accent/20 text-accent" : "bg-surface text-muted group-hover:text-accent"}`}>
          {icon}
        </span>
        <span className="flex-1 truncate text-sm font-medium">{channel.name}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-surface/80 backdrop-blur border-r border-white/5 px-4 py-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
        <span>Текстовые каналы</span>
        <button
          type="button"
          onClick={() => onCreateChannel?.("TEXT")}
          className="rounded-full px-2 py-1 text-muted hover:text-accent"
        >
          +
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {textChannels.length ? textChannels.map((channel) => renderChannel(channel, <Hash className="h-4 w-4" />)) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-surfaceElevated px-3 py-4 text-xs text-muted">
            Нет текстовых каналов
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
        <span>Голосовые каналы</span>
        <button
          type="button"
          onClick={() => onCreateChannel?.("VOICE")}
          className="rounded-full px-2 py-1 text-muted hover:text-accent"
        >
          +
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {voiceChannels.length ? voiceChannels.map((channel) => renderChannel(channel, <Mic className="h-4 w-4" />)) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-surfaceElevated px-3 py-4 text-xs text-muted">
            Нет голосовых каналов
          </div>
        )}
      </div>
    </aside>
  );
}
