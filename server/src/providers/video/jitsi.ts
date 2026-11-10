import { randomBytes } from 'crypto';
import type { VideoProvider, MeetingRoom } from './types.js';

export class JitsiVideoProvider implements VideoProvider {
  async createRoom(bookingId: string): Promise<MeetingRoom> {
    const randomSuffix = randomBytes(8).toString('hex');
    const roomId = `prepant-${bookingId}-${randomSuffix}`;
    return {
      provider: 'jitsi',
      roomId,
      url: `https://meet.jit.si/${roomId}`,
    };
  }

  getJoinInfo(bookingId: string, _userId: string): MeetingRoom {
    const roomId = `prepant-${bookingId}`;
    return {
      provider: 'jitsi',
      roomId,
      url: `https://meet.jit.si/${roomId}`,
    };
  }
}
