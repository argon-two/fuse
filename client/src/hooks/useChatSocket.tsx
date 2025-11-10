import { useEffect } from "react";
import type { Message } from "../types/api";
import { connectSocket } from "../lib/socket";

interface UseChatSocketOptions {
  channelId?: string;
  onMessage?: (message: Message) => void;
}

export function useChatSocket({ channelId, onMessage }: UseChatSocketOptions) {
  useEffect(() => {
    if (!channelId) {
      return;
    }

    const socket = connectSocket();
    if (!socket) {
      return;
    }

    socket.emit("chat:join", { channelId });
    const messageHandler = (payload: { channelId: string; message: Message }) => {
      if (payload.channelId === channelId) {
        onMessage?.(payload.message);
      }
    };
    socket.on("chat:message", messageHandler);

    return () => {
      socket.emit("chat:leave", { channelId });
      socket.off("chat:message", messageHandler);
    };
  }, [channelId, onMessage]);
}
