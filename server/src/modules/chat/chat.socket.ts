import type { Server, Socket } from "socket.io";
import { logger } from "../../lib/logger";

export function registerChatHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    logger.info("Socket connected", { socketId: socket.id });

    socket.on("chat:join", ({ channelId }: { channelId: string }) => {
      socket.join(`channel:${channelId}`);
      logger.debug("Socket joined channel", { socketId: socket.id, channelId });
    });

    socket.on("chat:leave", ({ channelId }: { channelId: string }) => {
      socket.leave(`channel:${channelId}`);
      logger.debug("Socket left channel", { socketId: socket.id, channelId });
    });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { socketId: socket.id });
    });
  });
}
