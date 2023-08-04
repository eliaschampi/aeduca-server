import { ObjectId } from "bson";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { IMessage, MESSAGE } from "../model/Message";

export async function byId(_id: string): Promise<WithId<IMessage> | null> {
  return await MESSAGE().findOne({ _id: new ObjectId(_id) });
}

export async function byRoom(
  room: string,
  dni: string,
  skip: number,
  take: number
): Promise<WithId<IMessage>[]> {
  const query = { room, deleted: { $nin: [dni] } };
  return await MESSAGE()
    .find(query)
    .sort({ created_at: 1 })
    .skip(skip)
    .limit(take)
    .toArray();
}

export async function newMessage(message: IMessage): Promise<InsertOneResult<IMessage>> {
  return await MESSAGE().insertOne(message);
}

export async function isReaded(room: string, dni: string): Promise<any> {
  const filter = { room, "from.dni": dni };

  const updateDoc = {
    $set: {
      is_readed: true
    }
  };

  return await MESSAGE().updateMany(filter, updateDoc);
}

export async function isDeleted(_id: string, dni: string): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $push: { deleted: dni }
  };

  return await MESSAGE().updateOne(filter, updateDoc);
}

export async function destroyMessage(_id: string): Promise<DeleteResult> {
  return await MESSAGE().deleteOne({ _id: new ObjectId(_id) });
}

export async function destroyByRoom(room: string): Promise<DeleteResult> {
  return await MESSAGE().deleteMany({ room });
}
