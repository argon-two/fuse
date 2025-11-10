import type { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setSocketServer(io: Server) {
  ioInstance = io;
}

export function getSocketServer() {
  if (!ioInstance) {
    throw new Error("Socket server not initialized");
  }
  return ioInstance;
}
