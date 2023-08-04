import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { db } from "../con/MongoConection";
import { IComment } from "./Comment";
import { Attached } from "./File";
import { personSingle } from "./Person";

const POST_COLLECTION = "post";

export type IPost = {
  _id?: ObjectId;
  content: string;
  commentable: boolean;
  link?: string;
  likes?: string[];
  creator: personSingle;
  share_w: string[];
  savelist?: string[];
  files?: Attached[];
  aproved: boolean;
  created_at: Date;
};

export type INewPost = {
  content: string;
  commentable: boolean;
  link?: string;
  creator: personSingle;
  share_w: string[]; //all, section_code[], pri, sec;
  files: Attached[];
  aproved: boolean;
};

export const NewPost = (post: INewPost): IPost => {
  return {
    content: post.content,
    commentable: post.commentable,
    link: post.link,
    creator: post.creator,
    share_w: post.share_w,
    files: post.files,
    aproved: post.aproved,
    created_at: new Date()
  };
};
//eslint-disable-next-line
export interface IPostDecorated extends IPost {
  comment_count: number;
  comment?: IComment;
}

export const POST = (): Collection<IPost> => {
  return db.collection<IPost>(POST_COLLECTION);
};
