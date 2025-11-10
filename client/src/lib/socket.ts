import { io, type Socket } from "socket.io-client";
import { getAccessToken, getCurrentServerUrl } from "../api/client";

let socket: Socket | null = null;

export function connectSocket() {
  const serverUrl = getCurrentServerUrl();
  const token = getAccessToken();
  if (!serverUrl || !token) {
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(serverUrl, {
    path: "/socket.io",
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function onSocketReconnect(handler: () => void) {
  if (!socket) return;
  socket.on("connect", handler);
}
