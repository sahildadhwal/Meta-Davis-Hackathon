import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentUrl = '';

export function getSocket(url: string): Socket {
  if (socket && currentUrl === url && socket.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUrl = url;
  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    timeout: 5000,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
