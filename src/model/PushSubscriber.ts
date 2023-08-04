import { ObjectId } from "bson";

export type PushSubscriber = {
  _id: ObjectId;
  dni: string;
};
