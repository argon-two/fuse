import type { ServerSummary } from "../types/api";
import { Flame, Plus } from "lucide-react";

interface ServerSidebarProps {
  servers: ServerSummary[];
  activeServerSlug?: string | null;
  onSelect: (server: ServerSummary) => void;
  onCreate?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ServerSidebar({ servers, activeServerSlug, onSelect, onCreate }: ServerSidebarProps) {
  return (
    <aside className="w-20 bg-surface flex flex-col items-center py-6 gap-4 border-r border-white/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-background shadow-glow">
        <Flame className="h-6 w-6" />
      </div>
      <div className="h-0.5 w-12 bg-white/5" />
      <nav className="flex flex-col items-center gap-3">
        {servers.map((server) => {
          const active = server.slug === activeServerSlug;
          return (
            <button
              key={server.id}
              onClick={() => onSelect(server)}
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition ${
                active
                  ? "border-accent bg-accent/10 text-accent shadow-glow"
                  : "border-transparent bg-surfaceElevated text-muted hover:text-accent hover:border-accent/40"
              }`}
              title={server.name}
            >
              <span className="text-lg font-semibold">{server.iconUrl ? "" : getInitials(server.name)}</span>
              {active ? <span className="absolute -left-2 h-6 w-1 rounded-full bg-accent" /> : null}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onCreate}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surfaceElevated text-muted transition hover:border-accent/50 hover:text-accent"
        >
          <Plus className="h-6 w-6" />
        </button>
      </nav>
    </aside>
  );
}
