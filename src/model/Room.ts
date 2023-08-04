import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { db } from "../con/MongoConection";
import { IMessage } from "./Message";
import { personSingle } from "./Person";

const ROOM_COLLECTION = "room";

export type IRoom = {
  _id?: ObjectId;
  name?: string;
  cpa?: string;
  cpa_enabled?: boolean;
  is_group: boolean;
  persons: personSingle[];
  image?: string;
  created_at: Date;
  updated_at: Date;
};

export type INewRoom = {
  name?: string;
  cpa?: string;
  cpa_enabled?: boolean;
  is_group: boolean;
  persons: personSingle[];
};

export const NewRoom = (room: INewRoom): IRoom => {
  return {
    name: room.name,
    cpa: room.cpa,
    cpa_enabled: room.cpa_enabled,
    is_group: room.is_group,
    persons: room.persons,
    created_at: new Date(),
    updated_at: new Date()
  };
};
//eslint-disable-next-line
export interface IRoomDecoratored extends IRoom {
  message_count: number;
  message: IMessage;
}

export const ROOM = (): Collection<IRoom> => {
  return db.collection<IRoom>(ROOM_COLLECTION);
};
