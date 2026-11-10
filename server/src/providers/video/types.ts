export interface MeetingRoom {
  provider: string;
  roomId: string;
  url: string;
}

export interface VideoProvider {
  createRoom(bookingId: string): Promise<MeetingRoom>;
  getJoinInfo(bookingId: string, userId: string): MeetingRoom;
}
