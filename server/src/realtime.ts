import type { Server } from 'socket.io';

let socketServer: Server | null = null;

export function setSocketServer(server: Server): void {
  socketServer = server;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  socketServer?.to(`user:${userId}`).emit(event, payload);
}

export function emitToConversation(conversationId: string, event: string, payload: unknown): void {
  socketServer?.to(`conversation:${conversationId}`).emit(event, payload);
}
