import { ObjectId } from "bson";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { ROOM_ADD_PERSON } from "../config/const";
import { personSingle } from "../model/Person";
import { IRoom, ROOM } from "../model/Room";

export async function byPerson(dni: string): Promise<any[]> {
  return await ROOM()
    .aggregate([
      {
        $match: { persons: { $elemMatch: { dni } } }
      },
      {
        $lookup: {
          from: "message",
          let: { myroomid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$room", "$$myroomid"] },
                deleted: { $nin: [dni] }
              }
            },
            {
              $sort: { created_at: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "messages"
        }
      },
      {
        $lookup: {
          from: "message",
          let: { myroomid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$room", "$$myroomid"] },
                deleted: { $nin: [dni] }
              }
            }
          ],
          as: "count"
        }
      },
      {
        $sort: { updated_at: -1 }
      },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          is_group: "$is_group",
          cpa: "$cpa",
          cpa_enabled: "$cpa_enabled",
          persons: "$persons",
          created_at: "$created_at",
          message: { $first: "$messages" },
          message_count: { $size: "$count" }
        }
      }
    ])
    .toArray();
}

export async function updateCpa(
  _id: string,
  cpa_enabled: boolean
): Promise<UpdateResult> {
  const filter = { _id: new ObjectId(_id) };

  const updateDoc = {
    $set: {
      cpa_enabled
    }
  };
  return await ROOM().updateOne(filter, updateDoc);
}

export async function byCpa(cpa: string): Promise<WithId<IRoom> | null> {
  return await ROOM().findOne({ cpa });
}

export async function newRoom(room: IRoom): Promise<InsertOneResult<IRoom>> {
  return await ROOM().insertOne(room);
}

export async function idsByDNI(dni: string): Promise<ObjectId[]> {
  const rooms = await ROOM()
    .find(
      { persons: { $elemMatch: { dni } }, is_group: false },
      { projection: { _id: true } }
    )
    .toArray();
  return rooms.map((item) => item._id);
}

export async function updatedAt(_id: string): Promise<UpdateResult> {
  return await ROOM().updateOne(
    { _id: new ObjectId(_id) },
    { $set: { updated_at: new Date() } }
  );
}

export async function destroyRoom(_id: string): Promise<DeleteResult> {
  return await ROOM().deleteOne({ _id: new ObjectId(_id) });
}

export async function togglePerson(
  _id: string,
  mode: string,
  person: personSingle
): Promise<{
  modifiedCount: number;
  ohh: string;
}> {
  const filter = { _id: new ObjectId(_id) };

  let updateDoc = {};
  let ohh = "se unió";

  if (mode === ROOM_ADD_PERSON) {
    updateDoc = { $push: { persons: person } };
  } else {
    updateDoc = { $pull: { persons: { dni: person.dni } } };
    ohh = "se salió";
  }

  const { modifiedCount } = await ROOM().updateOne(filter, updateDoc);

  return { modifiedCount, ohh };
}
