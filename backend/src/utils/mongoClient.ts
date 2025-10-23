import { MongoClient, Db, Collection, Document } from "mongodb";

const DEFAULT_URI =
  "mongodb+srv://trainwell-takehome:ZRq8gOrDNyPEsFup@cluster0.jppnq.mongodb.net/";
const DEFAULT_DB = "trainwell_takehome";

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI ?? DEFAULT_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? DEFAULT_DB;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
};

export const getCollection = <TSchema extends Document = Document>(
  collectionName: string
): Collection<TSchema> => {
  if (!db) {
    throw new Error("Database connection has not been established. Call connectToDatabase() first.");
  }
  return db.collection<TSchema>(collectionName);
};
