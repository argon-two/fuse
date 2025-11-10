import type { Message } from "../types/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Paperclip } from "lucide-react";

dayjs.extend(relativeTime);

interface MessageListProps {
  messages: Message[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function MessageList({ messages, onLoadMore, hasMore, isLoadingMore }: MessageListProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-4">
      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="mx-auto rounded-full bg-surface px-4 py-1 text-xs text-muted transition hover:text-accent"
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "Загрузка..." : "Загрузить предыдущие сообщения"}
        </button>
      ) : null}
      {messages.map((message) => (
        <article key={message.id} className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surfaceElevated text-sm font-semibold text-accent">
            {message.author.displayName?.[0] ?? message.author.username[0]}
          </div>
          <div className="flex-1">
            <header className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {message.author.displayName ?? message.author.username}
              </span>
              <span className="text-xs text-muted">
                {dayjs(message.createdAt).format("DD.MM.YYYY HH:mm")}
              </span>
            </header>
            {message.content ? (
              <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{message.content}</p>
            ) : null}

            {message.attachments?.length ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {message.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-muted transition hover:border-accent/40 hover:text-accent"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="max-w-[220px] truncate">{attachment.fileName}</span>
                    <span className="text-[10px] text-muted/70">
                      {(attachment.size / 1024 / 1024).toFixed(2)} МБ
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
      {!messages.length ? (
        <div className="flex h-full flex-col items-center justify-center text-sm text-muted">
          Сообщений пока нет. Будьте первыми!
        </div>
      ) : null}
    </div>
  );
}
