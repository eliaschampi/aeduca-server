import { Server as IO, Socket } from "socket.io";

let ioInstance: IO | undefined;

export function registerIO(io: IO): void {
  ioInstance = io;
}

export function getIO(): IO {
  if (!ioInstance) {
    throw new Error("Socket.IO instance not registered");
  }
  return ioInstance;
}

export type RoomJoiner = (socket: Socket, dni: string) => Promise<void> | void;

const roomJoiners: RoomJoiner[] = [];

export function registerRoomJoiner(joiner: RoomJoiner): void {
  roomJoiners.push(joiner);
}

export async function joinRooms(socket: Socket, dni: string): Promise<void> {
  for (const joiner of roomJoiners) {
    await joiner(socket, dni);
  }
}
