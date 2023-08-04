import { ObjectId } from "bson";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { COMMENT, IComment } from "../model/Comment";

export async function fetch(post_id: string): Promise<WithId<IComment>[]> {
  return await COMMENT().find({ post: post_id }).sort({ created_at: 1 }).toArray();
}

export async function store(comment: IComment): Promise<InsertOneResult<IComment>> {
  return await COMMENT().insertOne(comment);
}

export async function update(_id: string, message: string): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $set: {
      message
    }
  };

  return await COMMENT().updateOne(filter, updateDoc);
}

export async function remove(_id: string): Promise<DeleteResult> {
  return await COMMENT().deleteOne({ _id: new ObjectId(_id) });
}
