import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "../config/env";
import { registerChatHandlers } from "../modules/chat/chat.socket";
import { registerCallHandlers } from "../modules/call/call.socket";
import { setSocketServer } from "../lib/socket";
import { verifyToken, type AccessTokenPayload } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { createUnauthorized } from "../utils/errors";

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.appOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        throw createUnauthorized();
      }
      const payload = verifyToken<AccessTokenPayload>(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        throw createUnauthorized();
      }

      socket.data.user = {
        id: user.id,
        username: user.username,
        displayName: user.displayName ?? user.username,
        avatarUrl: user.avatarUrl,
      };
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Unauthorized"));
    }
  });

  registerChatHandlers(io);
  registerCallHandlers(io);
  setSocketServer(io);

  return io;
}
