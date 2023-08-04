import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { db } from "../con/MongoConection";
import { Attached } from "./File";
import { personSingle } from "./Person";

const COMMENT_COLLECTION = "comment";

export type IComment = {
  _id?: ObjectId;
  from: personSingle;
  post: string;
  message: string;
  attached?: Attached;
  reply_id?: string;
  content_type: string;
  url?: string;
  created_at: Date;
  updated_at?: Date;
};

export type INewComment = {
  from: personSingle;
  post: string;
  message: string;
  attached?: Attached;
  reply_id?: string;
  content_type: string;
  url?: string;
};

export const NewComment = (comment: INewComment): IComment => {
  return {
    from: comment.from,
    post: comment.post,
    message: comment.message,
    attached: comment.attached,
    reply_id: comment.reply_id,
    content_type: comment.content_type,
    url: comment.url,
    created_at: new Date()
  };
};

export const COMMENT = (): Collection<IComment> => {
  return db.collection<IComment>(COMMENT_COLLECTION);
};
