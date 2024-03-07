import { MongoClient, Db } from "mongodb";

const defaultDbname = "aeduca";
export let db: Db;

export const connect = async (dbName: string = defaultDbname): Promise<MongoClient> => {
  const client = new MongoClient(<string>process.env.MONGODB_URL);
  const conn = await client.connect();
  db = conn.db(dbName);
  return client;
};
