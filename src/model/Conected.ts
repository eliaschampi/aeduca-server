import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { db } from "../con/MongoConection";

const CONECTED_COLLECTION = "conected";

export type IConected = {
  _id?: ObjectId;
  dni: string;
  socketId: string;
  current_room: string | null;
};

export const CONECTED = (): Collection<IConected> => {
  return db.collection<IConected>(CONECTED_COLLECTION);
};
