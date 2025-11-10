import type { Server, Socket } from "socket.io";
import { logger } from "../../lib/logger";

type CallSignalPayload = {
  channelId: string;
  targetUserId?: string;
  signal: unknown;
};

export function registerCallHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("call:join", ({ channelId }: { channelId: string }) => {
      socket.join(`call:${channelId}`);
      const user = socket.data.user;
      const room = io.sockets.adapter.rooms.get(`call:${channelId}`);
      const existingPeers =
        room
          ? Array.from(room)
              .filter((peerId) => peerId !== socket.id)
              .map((peerId) => {
                const peerSocket = io.sockets.sockets.get(peerId);
                return {
                  socketId: peerId,
                  user: peerSocket?.data.user,
                };
              })
          : [];

      socket.emit("call:existing-peers", existingPeers);
      socket.to(`call:${channelId}`).emit("call:peer-joined", { socketId: socket.id, user });
      logger.debug("User joined call", { socketId: socket.id, channelId });
    });

    socket.on("call:signal", ({ channelId, targetUserId, signal }: CallSignalPayload) => {
      if (targetUserId) {
        const targetSocket = io.sockets.sockets.get(targetUserId);
        targetSocket?.emit("call:signal", { from: socket.id, signal });
      } else {
        socket.to(`call:${channelId}`).emit("call:signal", { from: socket.id, signal });
      }
    });

    socket.on("call:leave", ({ channelId }: { channelId: string }) => {
      socket.leave(`call:${channelId}`);
      socket.to(`call:${channelId}`).emit("call:peer-left", { socketId: socket.id });
      logger.debug("User left call", { socketId: socket.id, channelId });
    });
  });
}
