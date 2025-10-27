import { MongoClient, Db, Collection, Document } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : undefined;
};

export const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  const uri = getEnv("MONGODB_URI");
  const dbName = getEnv("MONGODB_DB_NAME");

  if (!uri || !dbName) {
    throw new Error(
      "Missing MongoDB configuration. Set MONGODB_URI and MONGODB_DB_NAME in backend/.env"
    );
  }

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
