import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { CONECTED, IConected } from "../model/Conected";

export async function bySocketID(socketId: string): Promise<WithId<IConected> | null> {
  return await CONECTED().findOne({ socketId });
}

export async function byDNI(dni: string): Promise<WithId<IConected>[]> {
  return await CONECTED().find({ dni }).toArray();
}

export async function clientHasConection(dni: string): Promise<boolean> {
  return (await CONECTED().findOne({ dni })) !== null;
}

export async function roomHasActives(current_room: string): Promise<boolean> {
  return (await CONECTED().find({ current_room }).toArray()).length > 1;
}

export async function createConection(
  dni: string,
  current_room: string | null,
  socketId: string
): Promise<InsertOneResult<IConected>> {
  return await CONECTED().insertOne({
    dni,
    current_room,
    socketId
  });
}

export async function updateCurrentRoom(
  socketId: string,
  current_room: string | null = null
): Promise<UpdateResult> {
  return await CONECTED().updateOne({ socketId }, { $set: { current_room } });
}

export async function destroyByDNI(dni: string): Promise<DeleteResult> {
  return await CONECTED().deleteMany({ dni });
}

export async function destroyBySocketId(socketId: string): Promise<DeleteResult> {
  return await CONECTED().deleteOne({ socketId });
}
