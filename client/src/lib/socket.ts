import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(url, { auth: { token }, autoConnect: true });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
