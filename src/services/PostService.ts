import { ObjectId } from "bson";
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { COMMENT } from "../model/Comment";
import { IPost, POST } from "../model/Post";

export async function fetchPosts(
  dni: string,
  skip: number,
  take: number,
  uid: string
): Promise<any[]> {
  let filter = {};
  if (uid === "saved") {
    filter = { savelist: dni };
  } else if (uid === "me") {
    filter = { "creator.dni": dni };
  } else {
    const main_filter = uid.split("_");
    filter = {
      $or: [{ share_w: { $in: main_filter }, aproved: true }, { "creator.dni": dni }]
    };
  }
  // uid = section_code | level

  return await POST()
    .aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: "comment",
          let: { mypostid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$post", "$$mypostid"] }
              }
            },
            {
              $sort: { created_at: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "comments"
        }
      },
      {
        $lookup: {
          from: "comment",
          let: { mypostid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$post", "$$mypostid"] }
              }
            }
          ],
          as: "count"
        }
      },

      {
        $sort: { fixed: -1, created_at: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: take
      },
      {
        $project: {
          likes: "$likes",
          content: "$content",
          commentable: "$commentable",
          link: "$link",
          creator: "$creator",
          share_w: "$share_w",
          savelist: "$savelist",
          files: "$files",
          created_at: "$created_at",
          fixed: "$fixed",
          comment_count: { $size: "$count" },
          comment: { $first: "$comments" }
        }
      }
    ])
    .toArray();
}

export async function mainCount(dni: string, uid: string): Promise<number> {
  let filter = {};
  if (uid === "saved") {
    filter = { savelist: dni };
  } else if (uid === "me") {
    filter = { "creator.dni": dni };
  } else {
    const main_filter = uid.split("_");
    filter = {
      $or: [{ share_w: { $in: main_filter }, aproved: true }, { "creator.dni": dni }]
    };
  }

  // uid |= section_code | level
  return await POST().count(filter);
}

export async function newPost(post: IPost): Promise<InsertOneResult<IPost>> {
  return await POST().insertOne(post);
}

export async function toggleSaved(
  post_id: string,
  dni: string,
  mode: "add" | "remove"
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(post_id) };

  let updateDoc = {};

  if (mode === "remove") {
    updateDoc = { $pull: { savelist: dni } };
  } else {
    updateDoc = { $push: { savelist: dni } };
  }

  return await POST().updateOne(filter, updateDoc);
}

export async function update(
  _id: string,
  content: string,
  link: string
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $set: {
      content,
      link
    }
  };
  return await POST().updateOne(filter, updateDoc);
}

export async function toggleComment(
  _id: string,
  commentable: boolean
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $set: {
      commentable
    }
  };
  return await POST().updateOne(filter, updateDoc);
}

export async function toggleFixed(
  _id: string,
  fixed: number | null
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $set: {
      fixed
    }
  };
  return await POST().updateOne(filter, updateDoc);
}

export async function toggleLike(
  post_id: string,
  dni: string,
  mode: "add" | "remove"
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(post_id) };

  let updateDoc = {};

  if (mode === "remove") {
    updateDoc = { $pull: { likes: dni } };
  } else {
    updateDoc = { $push: { likes: dni } };
  }

  return await POST().updateOne(filter, updateDoc);
}

export async function deletePost(post_id: string): Promise<DeleteResult> {
  // delete comments
  await COMMENT().deleteMany({ post: post_id });

  return await POST().deleteOne({ _id: new ObjectId(post_id) });
}
