import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { db } from "../con/MongoConection";
import { Attached } from "./File";
import { personSingle } from "./Person";

const MESSAGE_COLLECTION = "message";

export type IMessage = {
  _id?: ObjectId;
  from: personSingle;
  room: string;
  message: string;
  attached?: Attached;
  deleted: string[];
  is_readed: boolean;
  is_updated: boolean;
  reply_id?: string;
  content_type: string;
  url?: string;
  created_at: Date;
};

export type INewMessage = {
  from: personSingle;
  room: string;
  message: string;
  attached?: Attached;
  is_readed: boolean;
  reply_id?: string;
  content_type: string;
  url?: string;
};

export const NewMessage = (message: INewMessage): IMessage => {
  return {
    from: message.from,
    room: message.room,
    message: message.message,
    attached: message.attached,
    deleted: [],
    is_readed: message.is_readed,
    is_updated: false,
    reply_id: message.reply_id,
    content_type: message.content_type,
    url: message.url,
    created_at: new Date()
  };
};

export const MESSAGE = (): Collection<IMessage> => {
  return db.collection<IMessage>(MESSAGE_COLLECTION);
};
